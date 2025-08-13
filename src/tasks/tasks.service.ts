import { Response, NextFunction } from "express";
import db, { Task } from "../db.js";
import { AuthRequest } from "../middleware/auth-middleware.js";

// CREATE TASK
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const newTask: Task = {
      id: Date.now(),
      title: req.body.title,
      description: req.body.description,
      priority: (req.body.priority || "medium") as "low" | "medium" | "high",
      status: (req.body.status || "to-do") as "to-do" | "in-progress" | "done",
      user: req.userId,
      dependencies: req.body.dependencies || [], // Array of task IDs
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.tasks.push(newTask);
    await db.write();

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

// GET ALL TASKS
export const getAllTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userTasks = db.data.tasks.filter((task) => task.user === req.userId);
    res.json(userTasks);
  } catch (error) {
    next(error);
  }
};

// UPDATE TASK (with dependency check)
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const taskId = Number(req.params.id);
    const taskIndex = db.data.tasks.findIndex(
      (task) => task.id === taskId && task.user === req.userId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const currentTask = db.data.tasks[taskIndex];

    // If trying to mark as "done", check dependencies
    if (req.body.status === "done" && currentTask.dependencies.length > 0) {
      const incompleteDeps = currentTask.dependencies.filter((depId) => {
        const depTask = db.data.tasks.find(
          (t) => t.id === depId && t.user === req.userId
        );
        return !depTask || depTask.status !== "done";
      });

      if (incompleteDeps.length > 0) {
        return res.status(400).json({
          error:
            "Cannot mark this task as done until all dependencies are completed.",
        });
      }
    }

    db.data.tasks[taskIndex] = {
      ...currentTask,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.write();
    res.json(db.data.tasks[taskIndex]);
  } catch (error) {
    next(error);
  }
};

// DELETE TASK
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const taskId = Number(req.params.id);
    const taskIndex = db.data.tasks.findIndex(
      (task) => task.id === taskId && task.user === req.userId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const deletedTask = db.data.tasks.splice(taskIndex, 1)[0];
    await db.write();

    res.json({ message: "Task deleted successfully", task: deletedTask });
  } catch (error) {
    next(error);
  }
};
