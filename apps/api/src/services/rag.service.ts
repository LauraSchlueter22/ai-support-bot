import { db } from "../db/index.js";
import { chunks } from "../db/schema.js";
import { sql } from "drizzle-orm";
import { generateEmbedding } from "./openai.services.js";

const MAX_CHUNKS = 5;

export type RetrievedChunk = {
  id: string;
  content: string;
  documentId: string;
  similarity: number;
};

export async function retrieveRelevantChunks(
  query: string,
  tenantId: string,
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingString = `[${queryEmbedding.join(",")}]`;

  const results = await db.execute(sql`
        SELECT
        id,
        content,
        document_id as "documentId",
        1 - (embedding <=> ${embeddingString}::vector) as similarity
        FROM chunks
        WHERE tenant_id = ${tenantId}
        ORDER BY embedding <=> ${embeddingString}::vector
        LIMIT ${MAX_CHUNKS}
        `);

  return results.row as RetrievedChunk[];
}

export function buildSystemPrompt(chunks: RetrievedChunk[]): string {
  const context = chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
    .join("\n\n");

  return `You are a helpful customer support assistant. Answer questions based ONLY on the context provided below. If the answer is not in the context, say "I don't have information about that" and suggest the user contact human support.
      
      CONTEXT:
      ${context}

      INSTRUCTIONS:
      - Be concise and helpful
      - Only use information from the context above
      - If you're unsure, say so and escalate to human support
      - Always be polite and professional`;
}
