"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import { getAuthUser, clearAuthUser } from "../lib/auth";
import { Task } from "../types/task";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus] = useState<"to-do" | "in-progress" | "done">("to-do");

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "to-do" | "in-progress" | "done">("all");

  // Edit states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">("medium");
  const [editStatus, setEditStatus] = useState<"to-do" | "in-progress" | "done">("to-do");

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.push("/login");
      return;
    }
    api.get("/tasks").then((res) => setTasks(res.data));
  }, [router]);

  const addTask = async () => {
    if (!title.trim() || !description.trim()) return;
    const user = getAuthUser();
    if (!user) return;

    const res = await api.post("/tasks", {
      title,
      description,
      priority,
      status,
      user: user.id,
      dependencies: [],
    });
    setTasks((prev) => [...prev, res.data]);
    setTitle("");
    setDescription("");
    setStatus("to-do");
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditStatus(task.status);
  };

  const updateTask = async (id: string) => {
    const res = await api.put(`/tasks/${id}`, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      status: editStatus,
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    setEditingTaskId(null);
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const logout = () => {
    clearAuthUser();
    router.push("/login");
  };

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Smart Task Manager</h1>
          <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>

        {/* Create Task */}
        <div className="bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Task</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="flex-1 p-2 rounded bg-gray-700 border border-gray-600"
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
            <select
              className="p-2 rounded bg-gray-700 border border-gray-600"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="to-do">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={addTask}
              className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded font-semibold"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-6 flex gap-4">
          <select
            className="p-2 rounded bg-gray-700 border border-gray-600"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            className="p-2 rounded bg-gray-700 border border-gray-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Task List */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
          {filteredTasks.length === 0 ? (
            <p className="text-gray-400">No tasks match the filters.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Priority</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-t border-gray-600">
                    {editingTaskId === task.id ? (
                      <>
                        <td className="p-2">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-gray-700 p-1 rounded border border-gray-600 w-full"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="bg-gray-700 p-1 rounded border border-gray-600 w-full"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as any)}
                            className="bg-gray-700 p-1 rounded border border-gray-600"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                            className="bg-gray-700 p-1 rounded border border-gray-600"
                          >
                            <option value="to-do">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="p-2 space-x-2">
                          <button
                            onClick={() => updateTask(task.id)}
                            className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTaskId(null)}
                            className="bg-gray-500 px-3 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{task.title}</td>
                        <td className="p-2">{task.description}</td>
                        <td className="p-2 capitalize">{task.priority}</td>
                        <td className="p-2 capitalize">{task.status}</td>
                        <td className="p-2 space-x-2">
                          <button
                            onClick={() => startEditing(task)}
                            className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
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
