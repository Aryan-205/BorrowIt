import { Router } from "express";
import { postSignIn, postSignOut, postSignUp } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/signup", postSignUp);
authRouter.post("/signin", postSignIn);
authRouter.post("/signout", postSignOut);
