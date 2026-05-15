import type { User } from "../prisma/generated/prisma/client.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { prisma } from "../lib/db.js";

export function userToClient(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    karma: user.karma,
    karmaCount: user.karmaCount,
    isVerified: user.isVerified,
    avatarUrl: user.avatarUrl,
  };
}

function nameToUsername(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || "user";
}

async function uniqueUsername(base: string): Promise<string> {
  let username = base;
  let n = 0;
  while (await prisma.user.findUnique({ where: { username } })) {
    n += 1;
    username = `${base}${n}`;
  }
  return username;
}

export type SignUpBody = { name?: string; email?: string; password?: string };

export async function signUp(
  body: SignUpBody,
): Promise<{ ok: true; user: ReturnType<typeof userToClient> } | { ok: false; message: string }> {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return { ok: false, message: "name, email, and password are required" };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Invalid email address" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "An account with this email already exists" };
  }

  const username = await uniqueUsername(nameToUsername(name));
  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { username, email, password: hashed },
  });

  return { ok: true, user: userToClient(user) };
}

export type SignInBody = { email?: string; password?: string };

export async function signIn(
  body: SignInBody,
): Promise<{ ok: true; user: ReturnType<typeof userToClient> } | { ok: false; message: string }> {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return { ok: false, message: "email and password are required" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, message: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { ok: false, message: "Invalid email or password" };
  }

  return { ok: true, user: userToClient(user) };
}
