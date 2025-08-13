import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

// Define the shape of your database
export type Task = {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "to-do" | "in-progress" | "done";
  user: number;
  dependencies: number[];
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: number;
  name: string;
};

type Data = {
  users: User[];
  tasks: Task[];
};

// Create adapter and database instance
const adapter = new JSONFile<Data>("db.json");
const db = new Low<Data>(adapter, { users: [], tasks: [] });

export default db;
