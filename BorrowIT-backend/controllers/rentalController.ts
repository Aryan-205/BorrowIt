import type { Request, Response } from "express";
import { API_USER_ID } from "../config.js";
import {
  bookRental,
  findRentalById,
  generateHandoverQr,
  listRentalsForUser,
  rentalToClient,
} from "../models/rentalModel.js";

export function listRentals(_req: Request, res: Response) {
  const uid = API_USER_ID;
  res.json({ rentals: listRentalsForUser(uid) });
}

export function getRentalById(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const r = findRentalById(id);
  if (!r) {
    res.status(404).json({ message: "Rental not found" });
    return;
  }
  res.json({ rental: rentalToClient(r) });
}

export async function postBookRental(req: Request, res: Response) {
  const { itemId, totalDays } = req.body as { itemId?: string; totalDays?: number };
  try {
    const result = await bookRental(itemId ?? "", totalDays ?? 0, API_USER_ID);
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.json({ rental: rentalToClient(result.rental) });
  } catch (err) {
    console.error("postBookRental:", err);
    res.status(500).json({ message: "Failed to book rental" });
  }
}

export function postGenerateQr(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const result = generateHandoverQr(id);
  if (!result.ok) {
    res.status(404).json({ message: result.message });
    return;
  }
  res.json({ qrData: result.qrData, token: result.token });
}
