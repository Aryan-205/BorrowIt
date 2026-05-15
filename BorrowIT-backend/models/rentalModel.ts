import type { RentalRow } from "./types.js";
import { findItemById, setItemAvailable } from "./itemModel.js";

const rentals: RentalRow[] = [];

function scheduleAutoActivate(rental: RentalRow) {
  if (rental.activateTimer) clearTimeout(rental.activateTimer);
  rental.activateTimer = setTimeout(() => {
    if (rental.status === "PENDING") rental.status = "ACTIVE";
    rental.activateTimer = undefined;
  }, 8000);
}

export function rentalToClient(r: RentalRow) {
  return {
    id: r.id,
    status: r.status,
    itemId: r.itemId,
    borrowerId: r.borrowerId,
    itemOwnerId: r.itemOwnerId,
    totalDays: r.totalDays,
    itemTitle: r.itemTitle,
    itemDailyRate: r.itemDailyRate,
    itemMediaUrls: r.itemMediaUrls,
    pickupVideoUrl: r.pickupVideoUrl ?? null,
    returnVideoUrl: r.returnVideoUrl ?? null,
  };
}

export function listRentalsForUser(userId: string): RentalRow[] {
  return rentals.filter((r) => r.borrowerId === userId || r.itemOwnerId === userId);
}

export function findRentalById(id: string): RentalRow | undefined {
  return rentals.find((x) => x.id === id);
}

export async function bookRental(
  itemId: string,
  totalDays: number,
  borrowerId: string
): Promise<{ ok: true; rental: RentalRow } | { ok: false; message: string }> {
  if (!itemId || typeof totalDays !== "number" || totalDays < 1) {
    return { ok: false, message: "itemId and totalDays (>=1) required" };
  }
  const it = await findItemById(itemId);
  if (!it || !it.isAvailable) {
    return { ok: false, message: "Item not available" };
  }
  if (it.ownerId === borrowerId) {
    return { ok: false, message: "You cannot book your own listing" };
  }
  const id = `rent-${crypto.randomUUID().slice(0, 10)}`;
  const row: RentalRow = {
    id,
    itemId: it.id,
    borrowerId,
    itemOwnerId: it.ownerId,
    status: "PENDING",
    totalDays,
    itemTitle: it.title,
    itemDailyRate: it.dailyRate,
    itemMediaUrls: [...it.mediaUrls],
  };
  rentals.push(row);
  await setItemAvailable(it.id, false);
  return { ok: true, rental: row };
}

export function generateHandoverQr(rentalId: string):
  | { ok: true; qrData: string; token: string }
  | { ok: false; message: string } {
  const r = findRentalById(rentalId);
  if (!r) {
    return { ok: false, message: "Rental not found" };
  }
  const token = `${r.id.slice(-6).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  r.lastToken = token;
  const qrData = `borrowit://handover/${r.id}?t=${encodeURIComponent(token)}`;
  scheduleAutoActivate(r);
  return { ok: true, qrData, token };
}

export function countUserRentals(userId: string): number {
  return rentals.filter((x) => x.borrowerId === userId || x.itemOwnerId === userId).length;
}
