import { Router } from "express";
import { getChat, postMessage } from "../controllers/chatController.js";
import { requireAuth } from "../lib/requireAuth.js";

export const chatRouter = Router();

chatRouter.get("/:rentalId", requireAuth, getChat);
chatRouter.post("/:rentalId/messages", requireAuth, postMessage);
