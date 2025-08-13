import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

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

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type Data = {
  users: User[];
  tasks: Task[];
};

const adapter = new JSONFile<Data>("db.json");
const db = new Low<Data>(adapter, { users: [], tasks: [] });

export default db;
