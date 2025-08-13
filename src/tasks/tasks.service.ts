import { Request, Response, NextFunction } from "express";
import db, { Task } from "../db.js";
import { AuthRequest } from "../middleware/auth-middleware.js";

// Create task
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    // Validate dependencies
    const depIds: number[] = req.body.dependencies || [];
    const userTasks = db.data.tasks.filter((t) => t.user === req.userId);
    const invalidDeps = depIds.filter(
      (id) => !userTasks.some((t) => t.id === id)
    );
    if (invalidDeps.length) {
      return res.status(400).json({ error: "Invalid dependency IDs" });
    }

    const newTask: Task = {
      id: Date.now(),
      title: req.body.title,
      description: req.body.description,
      priority: (req.body.priority || "medium") as "low" | "medium" | "high",
      status: "to-do",
      user: req.userId,
      dependencies: depIds,
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

// Get all tasks
export const getAllTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const userTasks = db.data.tasks.filter((task) => task.user === req.userId);
    res.json(userTasks);
  } catch (error) {
    next(error);
  }
};

// Update task
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const taskId = Number(req.params.id);
    const taskIndex = db.data.tasks.findIndex(
      (t) => t.id === taskId && t.user === req.userId
    );
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = db.data.tasks[taskIndex];

    // Validate dependencies if updating them
    if (req.body.dependencies) {
      const depIds: number[] = req.body.dependencies;
      const userTasks = db.data.tasks.filter((t) => t.user === req.userId);
      const invalidDeps = depIds.filter(
        (id) => !userTasks.some((t) => t.id === id && t.id !== task.id)
      );
      if (invalidDeps.length) {
        return res.status(400).json({ error: "Invalid dependency IDs" });
      }
      task.dependencies = depIds;
    }

    // If marking done, check dependencies
    if (req.body.status === "done") {
      const allDepsDone = task.dependencies.every((depId) => {
        const depTask = db.data.tasks.find((t) => t.id === depId);
        return depTask && depTask.status === "done";
      });
      if (!allDepsDone) {
        return res
          .status(400)
          .json({ error: "Task blocked by incomplete dependencies" });
      }
    }

    // Update fields
    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined)
      task.description = req.body.description;
    if (req.body.priority !== undefined)
      task.priority = req.body.priority as "low" | "medium" | "high";
    if (req.body.status !== undefined) task.status = req.body.status;
    task.updatedAt = new Date().toISOString();

    db.data.tasks[taskIndex] = task;
    await db.write();
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Delete task
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const taskId = Number(req.params.id);
    const taskIndex = db.data.tasks.findIndex(
      (t) => t.id === taskId && t.user === req.userId
    );
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    db.data.tasks.splice(taskIndex, 1);
    await db.write();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get blocked tasks
export const getBlockedTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const userTasks = db.data.tasks.filter((task) => task.user === req.userId);
    const blocked = userTasks.filter((task) =>
      task.dependencies.some((depId) => {
        const depTask = userTasks.find((t) => t.id === depId);
        return depTask && depTask.status !== "done";
      })
    );
    res.json(blocked);
  } catch (error) {
    next(error);
  }
};
