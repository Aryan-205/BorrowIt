import type { Request, Response } from "express";
import { API_USER_ID } from "../config.js";
import { getCurrentUserProfile } from "../models/userModel.js";
import { prisma } from "../lib/db.js";

export function getMe(_req: Request, res: Response) {
  res.json({ user: getCurrentUserProfile(API_USER_ID) });
}

export async function createUser(req: Request, res: Response) {
  const { username, email, password } = req.body;
  const user = await prisma.user.create({
    data: { username, email, password },
  });
  res.json({ user });
}

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: id as string },
  });
  res.json({ user });
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const user = await prisma.user.update({
    where: { id: id as string },
    data: { username, email, password },
  });
  res.json({ user });
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.user.delete({ where: { id: id as string } });
  res.json({ message: "User deleted successfully" });
}