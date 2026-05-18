import { prisma } from "../lib/db.js";

// ─── Serialiser ───────────────────────────────────────────────────────────────

function messageToClient(m: {
  id: string;
  chatId: string;
  senderId: string | null;
  content: string;
  createdAt: Date;
  sender?: { id: string; username: string } | null;
}) {
  return {
    id: m.id,
    chatId: m.chatId,
    senderId: m.senderId,
    senderName: m.sender?.username ?? null,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  };
}

// ─── Get or create chat for a rental ─────────────────────────────────────────

export async function getOrCreateChat(rentalId: string, userId: string) {
  // verify user is participant in this rental
  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) return { ok: false as const, message: "Rental not found" };
  if (rental.borrowerId !== userId && rental.lenderId !== userId) {
    return { ok: false as const, message: "Not a participant in this rental" };
  }

  let chat = await prisma.chat.findUnique({
    where: { rentalId },
    include: {
      messages: {
        include: { sender: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: { rentalId },
      include: {
        messages: {
          include: { sender: { select: { id: true, username: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  return {
    ok: true as const,
    chat: {
      id: chat.id,
      rentalId: chat.rentalId,
      messages: chat.messages.map(messageToClient),
    },
  };
}

// ─── Send a message ───────────────────────────────────────────────────────────

export async function sendMessage(rentalId: string, senderId: string, content: string) {
  if (!content.trim()) return { ok: false as const, message: "Message cannot be empty" };

  const chat = await prisma.chat.findUnique({ where: { rentalId } });
  if (!chat) return { ok: false as const, message: "Chat not found" };

  // Verify sender is participant
  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) return { ok: false as const, message: "Rental not found" };
  if (rental.borrowerId !== senderId && rental.lenderId !== senderId) {
    return { ok: false as const, message: "Not a participant" };
  }

  const message = await prisma.message.create({
    data: { chatId: chat.id, senderId, content: content.trim() },
    include: { sender: { select: { id: true, username: true } } },
  });

  return { ok: true as const, message: messageToClient(message) };
}
