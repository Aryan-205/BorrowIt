import type { Request, Response } from "express";
import { API_USER_ID } from "../config.js";
import { hashPassword } from "../lib/password.js";
import { getSessionUserId } from "../lib/session.js";
import { getCurrentUserProfile } from "../models/userModel.js";
import { userToClient } from "../models/authModel.js";
import { prisma } from "../lib/db.js";

export async function getMe(req: Request, res: Response) {
  const sessionUserId = getSessionUserId(req);
  if (sessionUserId) {
    const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
    if (!user) {
      res.status(401).json({ message: "Session invalid" });
      return;
    }
    res.json({ user: userToClient(user) });
    return;
  }
  res.json({ user: getCurrentUserProfile(API_USER_ID) });
}

export async function getUserById(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user: userToClient(user) });
}

export async function updateUser(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };
  const data: { username?: string; email?: string; password?: string } = {};
  if (username != null) data.username = username;
  if (email != null) data.email = email;
  if (password != null) data.password = await hashPassword(password);
  const user = await prisma.user.update({ where: { id }, data });
  res.json({ user: userToClient(user) });
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: id as string } });
  res.json({ message: "User deleted successfully" });
}