import { Router } from "express";
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
} from "./tasks.service.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const taskRouter: Router = Router();

taskRouter.get("/", authMiddleware, getAllTasks);
taskRouter.post("/", authMiddleware, createTask);
taskRouter.put("/:id", authMiddleware, updateTask);
taskRouter.delete("/:id", authMiddleware, deleteTask);

export default taskRouter;
