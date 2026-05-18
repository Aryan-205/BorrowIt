import type { Item, User } from "../prisma/generated/prisma/client.js";
import { API_USER_ID } from "../config.js";
import { prisma } from "../lib/db.js";
import type { ItemRow } from "./types.js";

type ItemWithOwner = Item & { owner: User };

function rowFromDb(it: ItemWithOwner): ItemRow {
  return {
    id: it.id,
    title: it.title,
    description: it.description,
    category: "Other",
    dailyRate: it.dailyRate,
    securityDeposit: it.securityDeposit,
    lat: it.lat ?? it.owner.latitude ?? 0,
    lng: it.lng ?? it.owner.longitude ?? 0,
    mediaUrls: it.images,
    isAvailable: it.isAvailable,
    specs: Array.isArray(it.specs) ? (it.specs as Array<{ label: string; value: string }>) : [],
    ownerId: it.ownerId,
    ownerName: it.owner.username,
    ownerKarma: it.owner.karma / 10,
    ownerKarmaCount: it.owner.karmaCount,
    ownerIsVerified: it.owner.isVerified,
  };
}

const ownerInclude = { owner: true } as const;

export function itemToClient(it: ItemRow) {
  return {
    id: it.id,
    title: it.title,
    description: it.description,
    category: it.category,
    dailyRate: it.dailyRate,
    securityDeposit: it.securityDeposit,
    lat: it.lat,
    lng: it.lng,
    mediaUrls: it.mediaUrls,
    isAvailable: it.isAvailable,
    specs: it.specs ?? [],
    ownerId: it.ownerId,
    ownerName: it.ownerName,
    ownerKarma: it.ownerKarma,
    ownerKarmaCount: it.ownerKarmaCount,
    ownerIsVerified: it.ownerIsVerified,
  };
}

export async function listClientItems(): Promise<ReturnType<typeof itemToClient>[]> {
  const rows = await prisma.item.findMany({
    include: ownerInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((it) => itemToClient(rowFromDb(it)));
}

export async function listMyItems(ownerId: string): Promise<ReturnType<typeof itemToClient>[]> {
  const rows = await prisma.item.findMany({
    where: { ownerId },
    include: ownerInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((it) => itemToClient(rowFromDb(it)));
}

export async function findItemById(id: string): Promise<ItemRow | null> {
  const it = await prisma.item.findUnique({
    where: { id },
    include: ownerInclude,
  });
  return it ? rowFromDb(it) : null;
}

export type CreateItemBody = Partial<ItemRow> & Record<string, unknown>;

export async function createItem(
  body: CreateItemBody,
): Promise<{ ok: true; item: ItemRow } | { ok: false; message: string }> {
  if (!body.title || typeof body.dailyRate !== "number" || typeof body.securityDeposit !== "number") {
    return { ok: false, message: "title, dailyRate, and securityDeposit are required" };
  }

  const ownerId = (body.ownerId as string) || API_USER_ID;
  const owner = await prisma.user.findUnique({ where: { id: ownerId } });
  if (!owner) {
    return { ok: false, message: "Owner not found" };
  }

  const created = await prisma.item.create({
    data: {
      title: String(body.title),
      description: typeof body.description === "string" ? body.description : "",
      dailyRate: body.dailyRate,
      securityDeposit: body.securityDeposit,
      lat: typeof body.lat === "number" ? body.lat : owner.latitude ?? 19.076,
      lng: typeof body.lng === "number" ? body.lng : owner.longitude ?? 72.8777,
      images: Array.isArray(body.mediaUrls) ? (body.mediaUrls as string[]) : [],
      specs: Array.isArray(body.specs) ? body.specs : [],
      isAvailable: true,
      ownerId,
    },
    include: ownerInclude,
  });

  return { ok: true, item: rowFromDb(created) };
}

export async function setItemAvailable(itemId: string, available: boolean): Promise<void> {
  await prisma.item.update({
    where: { id: itemId },
    data: { isAvailable: available },
  });
}

export async function updateItem(
  itemId: string,
  body: CreateItemBody,
): Promise<{ ok: true; item: ItemRow } | { ok: false; message: string }> {
  const existing = await prisma.item.findUnique({ where: { id: itemId } });
  if (!existing) {
    return { ok: false, message: "Item not found" };
  }

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      ...(body.title != null ? { title: String(body.title) } : {}),
      ...(typeof body.description === "string" ? { description: body.description } : {}),
      ...(typeof body.dailyRate === "number" ? { dailyRate: body.dailyRate } : {}),
      ...(typeof body.securityDeposit === "number" ? { securityDeposit: body.securityDeposit } : {}),
      ...(typeof body.lat === "number" ? { lat: body.lat } : {}),
      ...(typeof body.lng === "number" ? { lng: body.lng } : {}),
      ...(Array.isArray(body.mediaUrls) ? { images: body.mediaUrls as string[] } : {}),
      ...(Array.isArray(body.specs) ? { specs: body.specs } : {}),
      ...(typeof body.isAvailable === "boolean" ? { isAvailable: body.isAvailable } : {}),
    },
    include: ownerInclude,
  });

  return { ok: true, item: rowFromDb(updated) };
}

export async function deleteItem(
  itemId: string,
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  try {
    await prisma.item.delete({ where: { id: itemId } });
    return { ok: true, message: "Item deleted successfully" };
  } catch {
    return { ok: false, message: "Item not found" };
  }
}
