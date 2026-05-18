import type { Rental, Item, User } from "../prisma/generated/prisma/client.js";
import { RentalStatus } from "../prisma/generated/prisma/enums.js";
import { prisma } from "../lib/db.js";
import { setItemAvailable } from "./itemModel.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type RentalFull = Rental & {
  item: Item & { owner: User };
  borrower: User;
  lender: User;
};

// ─── Serialiser ───────────────────────────────────────────────────────────────

export function rentalToClient(r: RentalFull) {
  return {
    id: r.id,
    status: r.status,
    itemId: r.itemId,
    borrowerId: r.borrowerId,
    lenderId: r.lenderId,
    // keep old field name for app compat
    itemOwnerId: r.lenderId,
    totalDays: r.totalDays,
    itemTitle: r.item.title,
    itemDailyRate: r.itemDailyRate,
    itemMediaUrls: r.item.images,
    pickupVideoUrl: r.pickupVideoUrl ?? null,
    returnVideoUrl: r.returnVideoUrl ?? null,
    borrowerName: r.borrower.username,
    lenderName: r.lender.username,
  };
}

const INCLUDE = {
  item: { include: { owner: true } },
  borrower: true,
  lender: true,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listRentalsForUser(userId: string) {
  const rows = await prisma.rental.findMany({
    where: { OR: [{ borrowerId: userId }, { lenderId: userId }] },
    include: INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rentalToClient);
}

export async function findRentalById(id: string) {
  const r = await prisma.rental.findUnique({ where: { id }, include: INCLUDE });
  return r ? rentalToClient(r) : null;
}

// ─── Book ─────────────────────────────────────────────────────────────────────

export async function bookRental(
  itemId: string,
  totalDays: number,
  borrowerId: string
): Promise<{ ok: true; rental: ReturnType<typeof rentalToClient> } | { ok: false; message: string }> {
  if (!itemId || typeof totalDays !== "number" || totalDays < 1) {
    return { ok: false, message: "itemId and totalDays (>=1) required" };
  }

  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { owner: true } });
  if (!item || !item.isAvailable) {
    return { ok: false, message: "Item not available" };
  }
  if (item.ownerId === borrowerId) {
    return { ok: false, message: "You cannot book your own listing" };
  }

  const rental = await prisma.rental.create({
    data: {
      itemId: item.id,
      borrowerId,
      lenderId: item.ownerId,
      status: RentalStatus.PENDING,
      totalDays,
      itemDailyRate: item.dailyRate,
    },
    include: INCLUDE,
  });

  // Create a chat for this rental
  await prisma.chat.create({ data: { rentalId: rental.id } });

  await setItemAvailable(item.id, false);

  return { ok: true, rental: rentalToClient(rental) };
}

// ─── Generate handover QR ─────────────────────────────────────────────────────

export async function generateHandoverQr(
  rentalId: string,
  requestingUserId: string
): Promise<{ ok: true; qrData: string; token: string } | { ok: false; message: string }> {
  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) return { ok: false, message: "Rental not found" };
  if (rental.lenderId !== requestingUserId) {
    return { ok: false, message: "Only the lender can generate the handover QR" };
  }
  if (rental.status !== RentalStatus.PENDING) {
    return { ok: false, message: "Rental is not in PENDING state" };
  }

  const token = `${rentalId.slice(-6).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const qrData = `borrowit://handover/${rentalId}?t=${encodeURIComponent(token)}`;

  await prisma.rental.update({
    where: { id: rentalId },
    data: { lastToken: token },
  });

  return { ok: true, qrData, token };
}

// ─── Scan QR (borrower confirms pickup) ───────────────────────────────────────

export async function scanHandoverQr(
  rentalId: string,
  token: string,
  borrowerId: string
): Promise<{ ok: true; rental: ReturnType<typeof rentalToClient> } | { ok: false; message: string }> {
  const rental = await prisma.rental.findUnique({ where: { id: rentalId }, include: INCLUDE });
  if (!rental) return { ok: false, message: "Rental not found" };
  if (rental.borrowerId !== borrowerId) {
    return { ok: false, message: "Not authorised" };
  }
  if (rental.status !== RentalStatus.PENDING) {
    return { ok: false, message: "Rental is not in PENDING state" };
  }
  if (!rental.lastToken || rental.lastToken !== token) {
    return { ok: false, message: "Invalid or expired token" };
  }

  const updated = await prisma.rental.update({
    where: { id: rentalId },
    data: { status: RentalStatus.APPROVED, lastToken: null },
    include: INCLUDE,
  });

  return { ok: true, rental: rentalToClient(updated) };
}

// ─── Status transitions ───────────────────────────────────────────────────────

type RentalAction = "approve" | "complete" | "dispute";

export async function updateRentalStatus(
  rentalId: string,
  action: RentalAction,
  userId: string
): Promise<{ ok: true; rental: ReturnType<typeof rentalToClient> } | { ok: false; message: string }> {
  const rental = await prisma.rental.findUnique({ where: { id: rentalId }, include: INCLUDE });
  if (!rental) return { ok: false, message: "Rental not found" };

  const isLender = rental.lenderId === userId;
  const isBorrower = rental.borrowerId === userId;

  let newStatus: RentalStatus;

  switch (action) {
    case "approve":
      if (!isLender) return { ok: false, message: "Only the lender can approve" };
      if (rental.status !== RentalStatus.PENDING) return { ok: false, message: "Can only approve PENDING rentals" };
      newStatus = RentalStatus.APPROVED;
      break;
    case "complete":
      if (!isLender && !isBorrower) return { ok: false, message: "Not authorised" };
      if (rental.status !== RentalStatus.APPROVED) return { ok: false, message: "Can only complete APPROVED rentals" };
      newStatus = RentalStatus.COMPLETED;
      break;
    case "dispute":
      if (!isLender && !isBorrower) return { ok: false, message: "Not authorised" };
      if (rental.status === RentalStatus.COMPLETED) return { ok: false, message: "Cannot dispute a completed rental" };
      newStatus = RentalStatus.DISPUTED;
      break;
    default:
      return { ok: false, message: "Invalid action" };
  }

  const updated = await prisma.rental.update({
    where: { id: rentalId },
    data: {
      status: newStatus,
      ...(newStatus === RentalStatus.COMPLETED ? { activateTimer: null } : {}),
    },
    include: INCLUDE,
  });

  // Free up the item when rental is completed
  if (newStatus === RentalStatus.COMPLETED) {
    await setItemAvailable(rental.itemId, true);
  }

  return { ok: true, rental: rentalToClient(updated) };
}
