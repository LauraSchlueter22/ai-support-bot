import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "../services/auth.service.js";

type AuthEnv = {
    Variables: {
        user: JWTPayload;
    };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];

    if(!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        c.set("user", payload);
        return await next();
    } catch {
        return c.json({ error: "Invalid or expired token" }, 401);
    }
});
