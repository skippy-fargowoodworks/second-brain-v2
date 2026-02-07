"use client";

import { useState, useEffect } from "react";
import { Plus, FolderKanban, CheckCircle2, Clock, Pause } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: string;
  targetDate: string | null;
  taskCount: number;
  completedCount: number;
  progress: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(setProjects);
  }, []);

  const addProject = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, priority, targetDate: targetDate || null }),
    });
    const project = await res.json();
    setProjects([{ ...project, taskCount: 0, completedCount: 0, progress: 0 }, ...projects]);
    setName("");
    setDescription("");
    setTargetDate("");
    setShowForm(false);
  };

  const statusIcons: Record<string, typeof FolderKanban> = {
    active: Clock,
    completed: CheckCircle2,
    on_hold: Pause,
  };

  const statusColors: Record<string, string> = {
    active: "text-blue-400 bg-blue-400/10",
    completed: "text-green-400 bg-green-400/10",
    on_hold: "text-yellow-400 bg-yellow-400/10",
  };

  const priorityColors: Record<string, string> = {
    critical: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  };

  const active = projects.filter(p => p.status === "active");
  const other = projects.filter(p => p.status !== "active");

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Portfolio</h1>
            <p className="text-white/60">Organize your work into projects</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <input
              type="text"
              placeholder="Project name..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
            />
            <textarea
              placeholder="Description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
              rows={2}
            />
            <div className="flex gap-3">
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
              <button onClick={addProject} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Create
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <FolderKanban className="h-5 w-5 text-blue-400" /> Active Projects ({active.length})
          </h2>
          {active.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No active projects. Start organizing your work!
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {active.map(p => {
                const StatusIcon = statusIcons[p.status] || Clock;
                return (
                  <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${statusColors[p.status]}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{p.name}</h3>
                          {p.description && <p className="mt-0.5 text-sm text-white/60">{p.description}</p>}
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${priorityColors[p.priority]}`}>{p.priority}</span>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">{p.completedCount}/{p.taskCount} tasks</span>
                        <span className="text-white">{p.progress}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                    {p.targetDate && (
                      <p className="text-xs text-white/40">Due: {new Date(p.targetDate).toLocaleDateString()}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {other.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white">Other Projects</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {other.map(p => {
                const StatusIcon = statusIcons[p.status] || Clock;
                return (
                  <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-70">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-1.5 ${statusColors[p.status]}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{p.name}</h3>
                        <p className="text-xs text-white/60">{p.status.replace("_", " ")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
