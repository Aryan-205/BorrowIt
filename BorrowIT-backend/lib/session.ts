import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "borrowit_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-session-secret-change-in-production";
}

type SessionPayload = { userId: string; exp: number };

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (typeof parsed.userId !== "string" || typeof parsed.exp !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function sign(encoded: string): string {
  return createHmac("sha256", sessionSecret()).update(encoded).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = { userId, exp: Date.now() + MAX_AGE_MS };
  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  const payload = decodePayload(encoded);
  if (!payload || payload.exp < Date.now()) return null;
  return payload.userId;
}

function parseCookieHeader(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return undefined;
}

export function getSessionUserId(req: Request): string | null {
  return verifySessionToken(parseCookieHeader(req.headers.cookie, COOKIE_NAME));
}

export function setSessionCookie(res: Response, userId: string): void {
  res.cookie(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}
