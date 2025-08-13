import { Request, Response, NextFunction } from "express";
import db, { Task } from "../db.js";

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    const newTask: Task = {
      id: Date.now(),
      title: req.body.title,
      description: req.body.description,
      priority: (req.body.priority || "medium") as "low" | "medium" | "high",
      status: "to-do",
      user: req.body.user,
      dependencies: req.body.dependencies || [],
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

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();
    res.json(db.data.tasks);
  } catch (error) {
    next(error);
  }
};
