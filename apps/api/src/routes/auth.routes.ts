import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { RegisterSchema, LoginSchema } from "@ai-support-bot/schemas";
import { registerUser, loginUser } from "../services/auth.service.js";

const authRoutes = new Hono();

authRoutes.post("/register", zValidator("json", RegisterSchema), async (c) => {
  const body = c.req.valid("json");

  try {
    const result = await registerUser(
      body.email,
      body.password,
      body.organizationName,
    );
    return c.json(result, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return c.json({ error: message }, 400);
  }
});

authRoutes.post("/login", zValidator("json", LoginSchema), async (c) => {
  const body = c.req.valid("json");

  try {
    const result = await loginUser(body.email, body.password);
    return c.json(result, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return c.json({ error: message }, 400);
  }
});

export default authRoutes;
