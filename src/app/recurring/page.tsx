"use client";

import { useState, useEffect } from "react";
import { Plus, Repeat, Calendar, Play, Pause } from "lucide-react";

interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  schedule: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  lastGenerated: string | null;
  active: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function RecurringPage() {
  const [recurring, setRecurring] = useState<RecurringTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [schedule, setSchedule] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  useEffect(() => {
    fetch("/api/recurring").then(r => r.json()).then(setRecurring);
  }, []);

  const addRecurring = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        priority,
        schedule,
        dayOfWeek: schedule === "weekly" ? dayOfWeek : null,
        dayOfMonth: schedule === "monthly" ? dayOfMonth : null,
        generate: true,
      }),
    });
    const task = await res.json();
    setRecurring([task, ...recurring]);
    setTitle("");
    setDescription("");
    setShowForm(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/recurring/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setRecurring(recurring.map(r => r.id === id ? { ...r, active } : r));
  };

  const generateNow = async () => {
    const res = await fetch("/api/recurring/generate", { method: "POST" });
    const data = await res.json();
    alert(`Generated ${data.count} task(s)`);
  };

  const getScheduleText = (r: RecurringTask) => {
    if (r.schedule === "daily") return "Every day";
    if (r.schedule === "weekly") return `Every ${DAYS[r.dayOfWeek || 0]}`;
    if (r.schedule === "monthly") return `Day ${r.dayOfMonth} of each month`;
    return r.schedule;
  };

  const scheduleColors: Record<string, string> = {
    daily: "text-green-400 bg-green-400/10",
    weekly: "text-blue-400 bg-blue-400/10",
    monthly: "text-purple-400 bg-purple-400/10",
  };

  const active = recurring.filter(r => r.active);
  const inactive = recurring.filter(r => !r.active);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Recurring Tasks</h1>
            <p className="text-white/60">Automate your routine work</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={generateNow}
              className="flex items-center gap-2 rounded-lg bg-green-600/20 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-600/30"
            >
              <Play className="h-4 w-4" /> Generate Now
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Add Template
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
            />
            <input
              type="text"
              placeholder="Description (optional)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
            />
            <div className="flex flex-wrap gap-3">
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
              <select
                value={schedule}
                onChange={e => setSchedule(e.target.value as "daily" | "weekly" | "monthly")}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {schedule === "weekly" && (
                <select
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(parseInt(e.target.value))}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                >
                  {DAYS.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>
              )}
              {schedule === "monthly" && (
                <select
                  value={dayOfMonth}
                  onChange={e => setDayOfMonth(parseInt(e.target.value))}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                  ))}
                </select>
              )}
              <button onClick={addRecurring} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Create
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Repeat className="h-5 w-5 text-blue-400" /> Active Templates ({active.length})
          </h2>
          {active.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No recurring tasks. Create templates for routine work!
            </div>
          ) : (
            <div className="space-y-3">
              {active.map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2 ${scheduleColors[r.schedule]}`}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{r.title}</h3>
                      <p className="text-sm text-white/60">{getScheduleText(r)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(r.id, false)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {inactive.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-white opacity-60">Paused ({inactive.length})</h2>
            <div className="space-y-3 opacity-60">
              {inactive.map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <h3 className="font-medium text-white">{r.title}</h3>
                    <p className="text-sm text-white/60">{getScheduleText(r)}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(r.id, true)}
                    className="rounded-lg bg-green-600/20 px-3 py-1.5 text-sm text-green-400 hover:bg-green-600/30"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
