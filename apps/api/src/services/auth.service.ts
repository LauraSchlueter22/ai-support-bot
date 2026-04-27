import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, tenants } from "../db/schema.js";

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = "7d";

export type JWTPayload = {
  userId: string;
  tenantId: string;
  email: string;
};

export async function registerUser(
  email: string,
  password: string,
  organizationName: string
) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email already in use");
  }

  const slug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const [tenant] = await db
    .insert(tenants)
    .values({ name: organizationName, slug })
    .returning();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, tenantId: tenant!.id })
    .returning();

  const token = jwt.sign(
    { userId: user!.id, tenantId: tenant!.id, email: user!.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user!.id,
      email: user!.email,
      organizationId: tenant!.id,
    },
  };
}

export async function loginUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { userId: user.id, tenantId: user.tenantId, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      organizationId: user.tenantId,
    },
  };
}
