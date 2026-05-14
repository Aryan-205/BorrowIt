import { Router } from "express";
import { getItemById, listItems, postItem } from "../controllers/itemController.js";

export const itemsRouter = Router();

itemsRouter.get("/", listItems);
itemsRouter.post("/", postItem);
itemsRouter.get("/:id", getItemById);
