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
  email: string;
};
