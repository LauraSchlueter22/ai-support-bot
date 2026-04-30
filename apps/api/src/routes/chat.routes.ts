import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { zValidator } from "@hono/zod-validator";
import { SendMessageSchema } from "@ai-support-bot/schemas";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getOrCreateConversation,
  saveMessage,
  detectEscalation,
  streamChatResponse,
} from "../services/chat.service.js";
import type { JWTPayload } from "../services/auth.service.js";

type AuthEnv = {
  Variables: {
    user: JWTPayload;
  };
};

const chatRoutes = new Hono<AuthEnv>();

chatRoutes.use("*", authMiddleware);

chatRoutes.post("/", zValidator("json", SendMessageSchema), async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");

  const conversation = await getOrCreateConversation(
    user.tenantId,
    body.conversationId,
  );

  const { stream, sources, relevantChunks } = await streamChatResponse(
    user.tenantId,
    body.content,
    conversation.id,
  );

  return streamText(c, async (streamWriter) => {
    let fullResponse = "";

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? "";
      if (text) {
        fullResponse += text;
        await streamWriter.write(text);
      }
    }

    await saveMessage(conversation.id, "assistant", fullResponse, sources);

    const escalated = detectEscalation(fullResponse);
    if (escalated) {
      await streamWriter.write(
        "\n\n[ESCALATION: Please contact our support team for further assistance]",
      );
    }

    await streamWriter.write(
      `\n\n[SOURCES:${JSON.stringify(
        relevantChunks.map((c) => ({
          documentId: c.documentId,
          excerpt: c.content.slice(0, 100),
        })),
      )}]`,
    );
  });
});

chatRoutes.get("/conversations", async (c) => {
  const user = c.get("user");

  const { conversations } = await import("../db/schema.js");
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../db/index.js");

  const tenantConversations = await db
    .select()
    .from(conversations)
    .where(eq(conversations.tenantId, user.tenantId));

  return c.json({ conversations: tenantConversations });
});

export default chatRoutes;
