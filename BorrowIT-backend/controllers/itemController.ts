import type { Request, Response } from "express";
import {
  createItem,
  findItemById,
  itemToClient,
  listClientItems,
  listMyItems,
  listOwnerItems,
  type CreateItemBody,
  updateItem as updateItemModel,
  deleteItem as deleteItemModel,
} from "../models/itemModel.js";

export async function listItems(_req: Request, res: Response) {
  try {
    const items = await listClientItems();
    res.json({ items });
  } catch (err) {
    console.error("listItems:", err);
    res.status(500).json({ message: "Failed to load items" });
  }
}

export async function postItem(req: Request, res: Response) {
  try {
    const result = await createItem({ ...(req.body as CreateItemBody), ownerId: req.userId! });
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.status(201).json({ item: itemToClient(result.item) });
  } catch (err) {
    console.error("postItem:", err);
    res.status(500).json({ message: "Failed to create item" });
  }
}

export async function getItemById(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const it = await findItemById(id);
    if (!it) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    const ownerItems = await listOwnerItems(it.ownerId, id);
    res.json({ item: itemToClient(it), ownerItems });
  } catch (err) {
    console.error("getItemById:", err);
    res.status(500).json({ message: "Failed to load item" });
  }
}

export async function updateItem(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const result = await updateItemModel(id, req.body as CreateItemBody);
    if (!result.ok) {
      res.status(400).json({ message: result.message });
      return;
    }
    res.json({ item: itemToClient(result.item) });
  } catch (err) {
    console.error("updateItem:", err);
    res.status(500).json({ message: "Failed to update item" });
  }
}

export async function listMyItemsController(req: Request, res: Response) {
  try {
    const items = await listMyItems(req.userId!);
    res.json({ items });
  } catch (err) {
    console.error("listMyItems:", err);
    res.status(500).json({ message: "Failed to load your items" });
  }
}

export async function deleteItem(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0] ?? "";
  try {
    const result = await deleteItemModel(id);
    if (!result.ok) {
      res.status(404).json({ message: result.message });
      return;
    }
    res.json({ message: result.message });
  } catch (err) {
    console.error("deleteItem:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
}
