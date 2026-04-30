import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { db } from "../db/index.js";
import { eq } from "drizzle-orm";
import { ingestDocument } from "../services/ingest.service.js";
import { documents } from "../db/schema.js";
import { JWTPayload } from "../services/auth.service.js";

type AuthEnv = {
  Variables: {
    user: JWTPayload;
  };
};

const documentRoutes = new Hono<AuthEnv>();

documentRoutes.use("*", authMiddleware);

documentRoutes.post("/upload", async (c) => {
  const user = c.get("user");
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const allowedTypes = ["text/plain", "text/markdown"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Only text and markdown files are supported" }, 400);
  }

  const [document] = await db
    .insert(documents)
    .values({
      tenantId: user.tenantId,
      name: file.name,
      s3Key: `${user.tenantId}/${file.name}`,
      status: "pending",
    })
    .returning();

  const buffer = Buffer.from(await file.arrayBuffer());

  ingestDocument(user.tenantId, document!.id, buffer, file.type).catch(
    (error) => {
      console.error("Ingest failed:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    },
  );
  return c.json({ document }, 202);
});

documentRoutes.get("/", async (c) => {
  const user = c.get("user");

  const tenantDocuments = await db
    .select()
    .from(documents)
    .where(eq(documents.tenantId, user.tenantId));

  return c.json({ documents: tenantDocuments });
});

documentRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const documentId = c.req.param("id");

  await db.delete(documents).where(eq(documents.id, documentId));

  return c.json({ success: true });
});

export default documentRoutes;
