import type { Request, Response } from "express";
import {
  bookRental,
  findRentalById,
  generateHandoverQr,
  listRentalsForUser,
  scanHandoverQr,
  updateRentalStatus,
} from "../models/rentalModel.js";

export async function listRentals(req: Request, res: Response) {
  try {
    const rentals = await listRentalsForUser(req.userId!);
    res.json({ rentals });
  } catch (err) {
    console.error("listRentals:", err);
    res.status(500).json({ message: "Failed to load rentals" });
  }
}

export async function getRentalById(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const rental = await findRentalById(id);
    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }
    res.json({ rental });
  } catch (err) {
    console.error("getRentalById:", err);
    res.status(500).json({ message: "Failed to load rental" });
  }
}

export async function postBookRental(req: Request, res: Response) {
  const { itemId, totalDays } = req.body as { itemId?: string; totalDays?: number };
  try {
    const result = await bookRental(itemId ?? "", totalDays ?? 0, req.userId!);
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.status(201).json({ rental: result.rental });
  } catch (err) {
    console.error("postBookRental:", err);
    res.status(500).json({ message: "Failed to book rental" });
  }
}

export async function postGenerateQr(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const result = await generateHandoverQr(id, req.userId!);
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.json({ qrData: result.qrData, token: result.token });
  } catch (err) {
    console.error("postGenerateQr:", err);
    res.status(500).json({ message: "Failed to generate QR" });
  }
}

export async function postScanQr(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const { token } = req.body as { token?: string };
  if (!token) {
    res.status(400).json({ message: "token is required" });
    return;
  }
  try {
    const result = await scanHandoverQr(id, token, req.userId!);
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.json({ rental: result.rental });
  } catch (err) {
    console.error("postScanQr:", err);
    res.status(500).json({ message: "Failed to scan QR" });
  }
}

export async function patchRentalStatus(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const { action } = req.body as { action?: string };
  if (!action) {
    res.status(400).json({ message: "action is required (approve | complete | dispute)" });
    return;
  }
  try {
    const result = await updateRentalStatus(id, action as any, req.userId!);
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.json({ rental: result.rental });
  } catch (err) {
    console.error("patchRentalStatus:", err);
    res.status(500).json({ message: "Failed to update rental status" });
  }
}
