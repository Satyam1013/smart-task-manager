import express from "express";
import taskRouter from "./tasks/tasks.controller.js";
import cors from "cors";
import db from "./db.js";
import userRouter from "./users/users.controller.js";

const app = express();
app.use(cors());
app.use(express.json());

// Load the database on server start
await db.read();

app.use("/users", userRouter);
app.use("/tasks", taskRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
