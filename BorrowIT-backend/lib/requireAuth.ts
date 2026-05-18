import type { Request, Response, NextFunction } from "express";
import { getSessionUserId } from "./session.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = getSessionUserId(req);
  if (!userId) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  req.userId = userId;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const userId = getSessionUserId(req);
  if (userId) req.userId = userId;
  next();
}
