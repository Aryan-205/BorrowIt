import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./createApp.js";
import { createWsServer } from "./lib/wsServer.js";
import { prisma } from "./lib/db.js";

const PORT = Number(process.env.PORT);

const app = createApp();
const server = createServer(app);
createWsServer(server);

// Connect to DB on startup, then keep connection alive with a ping every 4 minutes
// (Neon idles after 5 min, this prevents P1017 drops)
prisma.$connect()
  .then(() => console.log("[db] Connected to Neon"))
  .catch((e) => console.error("[db] Initial connect failed:", e));

setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    console.warn("[db] Keep-alive ping failed, reconnecting...", e?.code);
    await prisma.$disconnect().catch(() => {});
    await prisma.$connect().catch(() => {});
  }
}, 4 * 60 * 1000); // every 4 minutes

server.listen(PORT, "0.0.0.0", () => {
  console.log(`BorrowIt API + WS listening on http://localhost:${PORT}`);
});
