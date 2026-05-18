import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { verifySessionToken } from "./session.js";
import { sendMessage, getOrCreateChat } from "../models/chatModel.js";

const COOKIE_NAME = "borrowit_session";

function parseCookieHeader(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return undefined;
}

// Map: rentalId -> Set<WebSocket>
const rooms = new Map<string, Set<WebSocket>>();

function getRoom(rentalId: string): Set<WebSocket> {
  if (!rooms.has(rentalId)) rooms.set(rentalId, new Set());
  return rooms.get(rentalId)!;
}

function broadcast(rentalId: string, payload: unknown, exclude?: WebSocket) {
  const room = getRoom(rentalId);
  const str = JSON.stringify(payload);
  for (const ws of room) {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
      ws.send(str);
    }
  }
}

export function createWsServer(server: import("http").Server) {
  const wss = new WebSocketServer({ noServer: true });

  // Upgrade handler — called from index.ts
  server.on("upgrade", async (req: IncomingMessage, socket, head) => {
    // Expect path: /ws/chat/:rentalId
    const match = req.url?.match(/^\/ws\/chat\/([^/?]+)/);
    if (!match) {
      socket.destroy();
      return;
    }
    const rentalId = match[1];

    // Auth via session cookie
    const sessionToken = parseCookieHeader(req.headers.cookie, COOKIE_NAME);
    if (!sessionToken) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    const userId = verifySessionToken(sessionToken);
    if (!userId) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req, rentalId, userId);
    });
  });

  wss.on("connection", async (ws: WebSocket, _req: IncomingMessage, rentalId: string, userId: string) => {
    // Verify access to the rental
    const result = await getOrCreateChat(rentalId, userId);
    if (!result.ok) {
      ws.close(4003, result.message);
      return;
    }

    const room = getRoom(rentalId);
    room.add(ws);

    // Send chat history on connect
    ws.send(JSON.stringify({ type: "history", messages: result.chat.messages }));

    ws.on("message", async (raw) => {
      let payload: { content?: string };
      try {
        payload = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
      }

      const content = payload.content?.trim();
      if (!content) {
        ws.send(JSON.stringify({ type: "error", message: "Empty message" }));
        return;
      }

      const msgResult = await sendMessage(rentalId, userId, content);
      if (!msgResult.ok) {
        ws.send(JSON.stringify({ type: "error", message: msgResult.message }));
        return;
      }

      const outbound = { type: "message", message: msgResult.message };
      // Echo back to sender
      ws.send(JSON.stringify(outbound));
      // Broadcast to rest of room
      broadcast(rentalId, outbound, ws);
    });

    ws.on("close", () => {
      room.delete(ws);
      if (room.size === 0) rooms.delete(rentalId);
    });
  });

  return wss;
}
