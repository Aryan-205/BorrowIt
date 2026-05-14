import cors from "cors";
import express from "express";
import { apiRouter } from "./routers/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/", (_req, res) => {
    res.json({ name: "BorrowIt API", health: "/health", api: "/api" });
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  return app;
}
