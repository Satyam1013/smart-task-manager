import { Router } from "express";
import { createUser, loginUser } from "./users.service.js";

const userRouter: Router = Router();

userRouter.post("/signup", createUser);
userRouter.post("/login", loginUser);

export default userRouter;
