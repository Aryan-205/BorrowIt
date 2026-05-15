import { Router } from "express";
import { deleteItem, getItemById, listItems, postItem, updateItem } from "../controllers/itemController.js";

export const itemsRouter = Router();

itemsRouter.get("/", listItems);
itemsRouter.post("/", postItem);
itemsRouter.get("/:id", getItemById);
itemsRouter.put("/:id", updateItem);
itemsRouter.delete("/:id", deleteItem);