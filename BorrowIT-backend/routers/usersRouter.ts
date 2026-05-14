import { Router } from "express";
import { createUser, getMe, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

export const usersRouter = Router();

usersRouter.get("/me", getMe);

usersRouter.get("/:id", getUserById);

usersRouter.post("/", createUser);

usersRouter.put("/:id", updateUser);

usersRouter.delete("/:id", deleteUser);
