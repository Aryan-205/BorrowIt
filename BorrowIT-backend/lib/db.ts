import { PrismaClient } from "../prisma/generated/prisma/client.js";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    // Neon serverless: keep connections alive and retry on drop
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Reconnect on cold-start / idle drops (Neon P1017)
export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isConnErr =
        err?.code === "P1017" || err?.code === "P1001" || err?.message?.includes("Server has closed");
      if (isConnErr && i < retries - 1) {
        console.warn(`[db] Connection dropped (${err.code}), reconnecting... (attempt ${i + 1})`);
        await prisma.$disconnect().catch(() => {});
        await prisma.$connect().catch(() => {});
        await new Promise((r) => setTimeout(r, 300 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error("withRetry: exhausted");
}
