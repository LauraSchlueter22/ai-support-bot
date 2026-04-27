import { z } from "zod";

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  s3Key: z.string(),
  status: z.enum(["pending", "processing", "ready", "failed"]),
  createdAt: z.string().datetime(),
});

export const UploadDocumentSchema = z.object({
  name: z.string().min(1),
  contentType: z.enum(["application/pdf", "text/plain", "text/markdown"]),
});

export type Document = z.infer<typeof DocumentSchema>;
export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>;
