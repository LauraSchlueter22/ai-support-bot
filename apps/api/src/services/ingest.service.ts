import { db } from "../db/index.js";
import { documents, chunks } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { chunkText, extractText } from "./chunking.service.js";
import { generateEmbeddings } from "./openai.services.js";

export async function ingestDocument(
  tenantId: string,
  documentId: string,
  buffer: Buffer,
  mimeType: string,
) {
  await db
    .update(documents)
    .set({ status: "processing" })
    .where(eq(documents.id, documentId));

  try {
    const text = extractText(buffer, mimeType);
    const textChunks = chunkText(text);

    const embeddings = await generateEmbeddings(textChunks);

    const chunkRecords = textChunks.map((content, index) => ({
      documentId,
      tenantId,
      content,
      embedding: embeddings[index],
      chunkIndex: index,
    }));

    await db.insert(chunks).values(chunkRecords);

    await db
      .update(documents)
      .set({ status: "ready" })
      .where(eq(documents.id, documentId));

    return { success: true, chunkCount: textChunks.length };
  } catch (error) {
    await db
      .update(documents)
      .set({ status: "failed" })
      .where(eq(documents.id, documentId));

    throw error;
  }
}
