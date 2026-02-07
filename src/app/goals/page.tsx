"use client";

import { useState, useEffect } from "react";
import { Plus, Target, TrendingUp } from "lucide-react";

interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  progress: number;
  category: string;
  keyResults: KeyResult[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Business");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    fetch("/api/goals").then(r => r.json()).then(setGoals);
  }, []);

  const addGoal = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, targetDate: targetDate || null }),
    });
    const goal = await res.json();
    setGoals([goal, ...goals]);
    setTitle("");
    setDescription("");
    setTargetDate("");
    setShowForm(false);
  };

  const updateKeyResult = async (goalId: string, krId: string, current: number) => {
    await fetch(`/api/goals/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyResults: [{ id: krId, current }] }),
    });
    // Refresh
    const res = await fetch("/api/goals");
    setGoals(await res.json());
  };

  const active = goals.filter(g => g.status === "active");
  const completed = goals.filter(g => g.status === "completed");

  const categoryColors: Record<string, string> = {
    Business: "text-blue-400 bg-blue-400/10",
    Personal: "text-purple-400 bg-purple-400/10",
    Family: "text-pink-400 bg-pink-400/10",
    Health: "text-green-400 bg-green-400/10",
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Goals & OKRs</h1>
            <p className="text-white/60">Track your objectives and key results</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Goal
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <input
              type="text"
              placeholder="Goal title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
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
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="Business">Business</option>
                <option value="Personal">Personal</option>
                <option value="Family">Family</option>
                <option value="Health">Health</option>
              </select>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                placeholder="Target date"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
              <button onClick={addGoal} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Add
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Target className="h-5 w-5 text-blue-400" /> Active Goals ({active.length})
          </h2>
          {active.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No active goals. Set your first objective!
            </div>
          ) : (
            <div className="space-y-4">
              {active.map(g => (
                <div key={g.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{g.title}</h3>
                      {g.description && <p className="mt-1 text-sm text-white/60">{g.description}</p>}
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${categoryColors[g.category] || categoryColors.Business}`}>
                      {g.category}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Progress</span>
                      <span className="text-white">{g.progress}%</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                  {g.keyResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-white/40 uppercase">Key Results</p>
                      {g.keyResults.map(kr => (
                        <div key={kr.id} className="flex items-center gap-3">
                          <input
                            type="number"
                            value={kr.current}
                            onChange={e => updateKeyResult(g.id, kr.id, parseFloat(e.target.value) || 0)}
                            className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                          />
                          <span className="text-sm text-white/60">/ {kr.target} {kr.unit}</span>
                          <span className="flex-1 text-sm text-white">{kr.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {g.targetDate && (
                    <p className="mt-3 text-xs text-white/40">Target: {new Date(g.targetDate).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-green-400" /> Completed ({completed.length})
            </h2>
            <div className="space-y-3">
              {completed.map(g => (
                <div key={g.id} className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-70">
                  <h3 className="font-medium text-white">{g.title}</h3>
                  <p className="mt-1 text-sm text-green-400">100% Complete</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
