'use client'

import { useEffect, useState } from "react";
import api from "./lib/api";
import { Task } from "./types/task";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Fetch tasks
  useEffect(() => {
    api.get("/tasks").then((res) => setTasks(res.data));
  }, []);

  // Add task
  const addTask = async () => {
    if (!title.trim() || !description.trim()) return;
    const res = await api.post("/tasks", {
      title,
      description,
      priority,
      user: 1,
      dependencies: [],
    });
    setTasks((prev) => [...prev, res.data]);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Smart Task Manager</h1>

        {/* Create Task Form */}
        <div className="bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Task</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              className="p-2 rounded bg-gray-700 border border-gray-600"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              onClick={addTask}
              className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded font-semibold"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-400">No tasks yet.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Priority</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-t border-gray-600">
                    <td className="p-2">{task.title}</td>
                    <td className="p-2">{task.description}</td>
                    <td className="p-2 capitalize">{task.priority}</td>
                    <td className="p-2 capitalize">{task.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
