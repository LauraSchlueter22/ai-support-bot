import OpenAI from "openai";
import { db } from "../db/index.js";
import { conversations, messages } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { retrieveRelevantChunks, buildSystemPrompt } from "./rag.service.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ESCALATION_PHRASES = [
  "I don't have information",
  "Contact human support",
  "I'm not sure",
  "I cannot help",
];

export async function getOrCreateConversation(
  tenantId: string,
  conversationId?: string,
) {
  if (conversationId) {
    const [existing] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (existing) return existing;
  }

  const [conversation] = await db
    .insert(conversations)
    .values({ tenantId })
    .returning();

  return conversation!;
}

export async function getConversationHistory(conversationId: string) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId));
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  sources?: string,
) {
  const [message] = await db
    .insert(messages)
    .values({ conversationId, role, content, sources })
    .returning();

  return message!;
}

export function detectEscalation(response: string): boolean {
  const lower = response.toLowerCase();
  return ESCALATION_PHRASES.some((phrase) => lower.includes(phrase));
}

export async function streamChatResponse(
  tenantId: string,
  userMessage: string,
  conversationId: string,
) {
  const relevantChunks = await retrieveRelevantChunks(userMessage, tenantId);
  const systemPrompt = buildSystemPrompt(relevantChunks);
  const history = await getConversationHistory(conversationId);

  const historyMessages = history.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  await saveMessage(conversationId, "user", userMessage);

  const sources = JSON.stringify(
    relevantChunks.map((chunk) => ({
      documentId: chunk.documentId,
      excerpt: chunk.content.slice(0, 100),
    })),
  );

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: userMessage },
    ],
  });
  return { stream, sources, relevantChunks };
}
