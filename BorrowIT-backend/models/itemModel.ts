import { API_USER_ID } from "../config.js";
import type { ItemRow } from "./types.js";

function seedItems(): ItemRow[] {
  const ownerId = "seed-owner";
  return [
    {
      id: "seed-drill-1",
      title: "Cordless drill kit",
      description: "18V, two batteries, charger included.",
      category: "Tools",
      dailyRate: 120,
      securityDeposit: 2000,
      lat: 19.076,
      lng: 72.8777,
      mediaUrls: [],
      isAvailable: true,
      ownerId,
      ownerName: "Riya",
      ownerKarma: 4.8,
      ownerKarmaCount: 12,
      ownerIsVerified: true,
    },
    {
      id: "seed-cam-1",
      title: "Mirrorless camera",
      description: "Body + 50mm lens. ND filter kit optional.",
      category: "Electronics",
      dailyRate: 450,
      securityDeposit: 15000,
      lat: 19.082,
      lng: 72.871,
      mediaUrls: [],
      isAvailable: true,
      ownerId,
      ownerName: "Riya",
      ownerKarma: 4.8,
      ownerKarmaCount: 12,
      ownerIsVerified: true,
    },
  ];
}

const items: ItemRow[] = seedItems();

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
    ownerId: it.ownerId,
    ownerName: it.ownerName,
    ownerKarma: it.ownerKarma,
    ownerKarmaCount: it.ownerKarmaCount,
    ownerIsVerified: it.ownerIsVerified,
  };
}

export function listClientItems() {
  return items.map(itemToClient);
}

export function findItemById(id: string): ItemRow | undefined {
  return items.find((i) => i.id === id);
}

export type CreateItemBody = Partial<ItemRow> & Record<string, unknown>;

export function createItem(body: CreateItemBody): { ok: true; item: ItemRow } | { ok: false; message: string } {
  if (!body.title || typeof body.dailyRate !== "number" || typeof body.securityDeposit !== "number") {
    return { ok: false, message: "title, dailyRate, and securityDeposit are required" };
  }
  const ownerId = (body.ownerId as string) || API_USER_ID;
  const id = `item-${crypto.randomUUID().slice(0, 8)}`;
  const row: ItemRow = {
    id,
    title: String(body.title),
    description: typeof body.description === "string" ? body.description : "",
    category: typeof body.category === "string" ? body.category : "Other",
    dailyRate: body.dailyRate,
    securityDeposit: body.securityDeposit,
    lat: typeof body.lat === "number" ? body.lat : 19.076,
    lng: typeof body.lng === "number" ? body.lng : 72.8777,
    mediaUrls: Array.isArray(body.mediaUrls) ? (body.mediaUrls as string[]) : [],
    isAvailable: true,
    ownerId,
    ownerName: ownerId === API_USER_ID ? "You" : "Lister",
    ownerKarma: 5,
    ownerKarmaCount: 0,
    ownerIsVerified: false,
  };
  items.push(row);
  return { ok: true, item: row };
}

export function setItemAvailable(itemId: string, available: boolean): void {
  const it = findItemById(itemId);
  if (it) it.isAvailable = available;
}
