import { Router } from "express";
import { getMe, getUserById, updateUser, deleteUser } from "../controllers/userController.js";
import { requireAuth } from "../lib/requireAuth.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, getMe);
usersRouter.get("/:id", getUserById);
usersRouter.put("/:id", requireAuth, updateUser);
usersRouter.delete("/:id", requireAuth, deleteUser);
