import { Router } from "express";
import { createUser, getAllUsers, loginUser } from "./users.service.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const userRouter: Router = Router();

userRouter.post("/signup", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/", authMiddleware, getAllUsers);

export default userRouter;
