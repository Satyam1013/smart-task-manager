import { Router } from "express";
import { createTask, getAllTasks } from "./tasks.service.js";

const taskRouter: Router = Router();

taskRouter.get("/", getAllTasks);
taskRouter.post("/", createTask);

export default taskRouter;
