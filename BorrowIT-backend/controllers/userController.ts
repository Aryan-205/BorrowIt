import type { Request, Response } from "express";
import { hashPassword } from "../lib/password.js";
import { userToClient } from "../models/authModel.js";
import { prisma } from "../lib/db.js";
import { RentalStatus } from "../prisma/generated/prisma/enums.js";

export async function getMe(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Build stats
    const [rentalCount, completedRentals, itemCount] = await Promise.all([
      prisma.rental.count({
        where: { OR: [{ borrowerId: req.userId }, { lenderId: req.userId }] },
      }),
      prisma.rental.count({
        where: {
          OR: [{ borrowerId: req.userId }, { lenderId: req.userId }],
          status: RentalStatus.COMPLETED,
        },
      }),
      prisma.item.count({ where: { ownerId: req.userId } }),
    ]);

    const reliabilityPct =
      rentalCount > 0 ? Math.round((completedRentals / rentalCount) * 100) : 100;

    res.json({
      user: {
        ...userToClient(user),
        karmaScore: user.karma / 10,
        rentalCount,
        completedRentals,
        reliabilityPct,
        itemCount,
      },
    });
  } catch (err) {
    console.error("getMe:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
}

export async function getUserById(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user: userToClient(user) });
  } catch (err) {
    console.error("getUserById:", err);
    res.status(500).json({ message: "Failed to load user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  // Only allow updating own profile
  if (req.userId && req.userId !== id) {
    res.status(403).json({ message: "Cannot update another user's profile" });
    return;
  }
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };
  const data: { username?: string; email?: string; password?: string } = {};
  if (username != null) data.username = username;
  if (email != null) data.email = email;
  if (password != null) data.password = await hashPassword(password);
  try {
    const user = await prisma.user.update({ where: { id }, data });
    res.json({ user: userToClient(user) });
  } catch (err) {
    console.error("updateUser:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
}
