import { Request, Response, NextFunction } from "express";
import db, { User } from "../db.js";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth-middleware.js";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = db.data.users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      password,
    } as User & { password: string };

    db.data.users.push(newUser);
    await db.write();

    res.status(201).json({
      message: "User created successfully",
      user: { id: newUser.id, name, email },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = db.data.users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id, email: user.email }, "SECRET_KEY", {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db.read();

    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userTasks = db.data.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    res.json(userTasks);
  } catch (error) {
    next(error);
  }
};
