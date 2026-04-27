import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(2),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    organizationId: z.string().uuid(),
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
