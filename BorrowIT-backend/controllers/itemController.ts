import type { Request, Response } from "express";
import {
  createItem,
  findItemById,
  itemToClient,
  listClientItems,
  type CreateItemBody,
  updateItem as updateItemModel,
  deleteItem as deleteItemModel,
} from "../models/itemModel.js";

export function listItems(_req: Request, res: Response) {
  res.json({ items: listClientItems() });
}

export function postItem(req: Request, res: Response) {
  const result = createItem(req.body as CreateItemBody);
  if (!result.ok) {
    res.status(400).json({ message: result.message });
    return;
  }
  res.status(201).json({ item: itemToClient(result.item) });
}

export function getItemById(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const it = findItemById(id);
  if (!it) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  res.json({ item: itemToClient(it) });
}

export function updateItem(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const result = updateItem(id, req.body as CreateItemBody);
  if (!result.ok) {
    res.status(400).json({ message: result.message });
    return;
  }
  res.json({ item: itemToClient(result.item) });
}

export function deleteItem(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  const result = deleteItem(id);
  if (!result.ok) {
    res.status(400).json({ message: result.message });
    return;
  }
  res.json({ message: "Item deleted successfully" });
}