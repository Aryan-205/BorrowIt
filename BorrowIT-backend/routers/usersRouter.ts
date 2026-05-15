import { Router } from "express";
import { getMe, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

export const usersRouter = Router();

usersRouter.get("/me", getMe);

usersRouter.get("/:id", getUserById);

usersRouter.put("/:id", updateUser);

usersRouter.delete("/:id", deleteUser);
