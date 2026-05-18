import { Router } from "express";
import { deleteItem, getItemById, listItems, listMyItemsController, postItem, updateItem } from "../controllers/itemController.js";
import { requireAuth } from "../lib/requireAuth.js";

export const itemsRouter = Router();

itemsRouter.get("/", listItems);
itemsRouter.get("/my", requireAuth, listMyItemsController);
itemsRouter.post("/", requireAuth, postItem);
itemsRouter.get("/:id", getItemById);
itemsRouter.put("/:id", requireAuth, updateItem);
itemsRouter.delete("/:id", requireAuth, deleteItem);
