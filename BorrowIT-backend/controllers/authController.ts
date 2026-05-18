import type { Request, Response } from "express";
import { signIn, signUp, type SignInBody, type SignUpBody } from "../models/authModel.js";
import { clearSessionCookie, setSessionCookie } from "../lib/session.js";

export async function postSignUp(req: Request, res: Response) {
  try {
    const result = await signUp(req.body as SignUpBody);
    if (!result.ok) {
      const status = result.message.includes("already exists") ? 409 : 400;
      res.status(status).json({ message: result.message });
      return;
    }
    const token = setSessionCookie(res, result.user.id);
    res.status(201).json({ user: result.user, token });
  } catch (err) {
    console.error("postSignUp:", err);
    res.status(500).json({ message: "Failed to create account" });
  }
}

export async function postSignIn(req: Request, res: Response) {
  try {
    const result = await signIn(req.body as SignInBody);
    if (!result.ok) {
      res.status(401).json({ message: result.message });
      return;
    }
    const token = setSessionCookie(res, result.user.id);
    res.json({ user: result.user, token });
  } catch (err) {
    console.error("postSignIn:", err);
    res.status(500).json({ message: "Failed to sign in" });
  }
}

export function postSignOut(_req: Request, res: Response) {
  clearSessionCookie(res);
  res.json({ ok: true });
}
