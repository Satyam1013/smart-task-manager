export type Task = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "to-do" | "in-progress" | "done";
  user: number;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
};

