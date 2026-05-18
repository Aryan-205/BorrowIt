import type { Request, Response } from "express";
import { getOrCreateChat, sendMessage } from "../models/chatModel.js";

export async function getChat(req: Request, res: Response) {
  const rentalId = typeof req.params.rentalId === "string" ? req.params.rentalId : req.params.rentalId?.[0] ?? "";
  try {
    const result = await getOrCreateChat(rentalId, req.userId!);
    if (!result.ok) {
      res.status(result.message === "Rental not found" ? 404 : 403).json({ message: result.message });
      return;
    }
    res.json({ chat: result.chat });
  } catch (err) {
    console.error("getChat:", err);
    res.status(500).json({ message: "Failed to load chat" });
  }
}

export async function postMessage(req: Request, res: Response) {
  const rentalId = typeof req.params.rentalId === "string" ? req.params.rentalId : req.params.rentalId?.[0] ?? "";
  const { content } = req.body as { content?: string };
  if (!content) {
    res.status(400).json({ message: "content is required" });
    return;
  }
  try {
    const result = await sendMessage(rentalId, req.userId!, content);
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.status(201).json({ message: result.message });
  } catch (err) {
    console.error("postMessage:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
}
