import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.route("/auth", authRoutes);
app.route("/documents", documentRoutes);

const port = Number(process.env.PORT) || 3001;
console.log(`API running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
