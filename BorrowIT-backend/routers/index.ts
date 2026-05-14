import { Router } from "express";
import { itemsRouter } from "./itemsRouter.js";
import { rentalsRouter } from "./rentalsRouter.js";
import { usersRouter } from "./usersRouter.js";

export const apiRouter = Router();

apiRouter.use("/items", itemsRouter);
apiRouter.use("/rentals", rentalsRouter);
apiRouter.use("/users", usersRouter);
