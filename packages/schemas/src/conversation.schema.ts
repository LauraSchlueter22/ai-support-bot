import { z } from "zod";

export const MessageRoleSchema = z.enum(["user", "assistant", "system"]);

export const MessageSchema = z.object({
  id: z.string().uuid(),
  role: MessageRoleSchema,
  content: z.string(),
  sources: z.array(z.object({
    documentId: z.string().uuid(),
    documentName: z.string(),
    excerpt: z.string(),
  })).optional(),
  createdAt: z.string().datetime(),
});

export const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().min(1).max(2000),
  tenantId: z.string().uuid(),
});

export const ChatResponseSchema = z.object({
  conversationId: z.string().uuid(),
  message: MessageSchema,
  escalated: z.boolean().default(false),
});

export type Message = z.infer<typeof MessageSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
