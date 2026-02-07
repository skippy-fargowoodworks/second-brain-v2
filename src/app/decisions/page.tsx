"use client";

import { useState, useEffect } from "react";
import { Plus, Check, X, Clock, AlertTriangle } from "lucide-react";

interface Decision {
  id: string;
  title: string;
  description: string | null;
  context: string | null;
  options: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [priority, setPriority] = useState("medium");
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    fetch("/api/decisions").then(r => r.json()).then(setDecisions);
  }, []);

  const addDecision = async () => {
    if (!title.trim()) return;
    const res = await fetch("/api/decisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, context, priority }),
    });
    const decision = await res.json();
    setDecisions([decision, ...decisions]);
    setTitle("");
    setDescription("");
    setContext("");
    setPriority("medium");
    setShowForm(false);
  };

  const resolveDecision = async (id: string) => {
    if (!resolution.trim()) return;
    const res = await fetch(`/api/decisions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    const updated = await res.json();
    setDecisions(decisions.map(d => d.id === id ? updated : d));
    setResolving(null);
    setResolution("");
  };

  const pending = decisions.filter(d => d.status === "pending");
  const resolved = decisions.filter(d => d.status === "resolved");

  const priorityColors: Record<string, string> = {
    critical: "text-red-400 bg-red-400/10",
    high: "text-orange-400 bg-orange-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    low: "text-green-400 bg-green-400/10",
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Decision Queue</h1>
            <p className="text-white/60">Decisions waiting for your input</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Decision
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <input
              type="text"
              placeholder="Decision title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
            />
            <textarea
              placeholder="Description (what needs to be decided?)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
              rows={2}
            />
            <textarea
              placeholder="Context (background info)..."
              value={context}
              onChange={e => setContext(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
              rows={2}
            />
            <div className="flex items-center gap-3">
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
              <button onClick={addDecision} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Add
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Clock className="h-5 w-5 text-yellow-400" /> Pending ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No pending decisions. You&apos;re all caught up!
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(d => (
                <div key={d.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{d.title}</h3>
                      {d.description && <p className="mt-1 text-sm text-white/60">{d.description}</p>}
                      {d.context && <p className="mt-2 text-sm text-white/40 italic">Context: {d.context}</p>}
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[d.priority]}`}>
                      {d.priority}
                    </span>
                  </div>
                  {resolving === d.id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter your decision..."
                        value={resolution}
                        onChange={e => setResolution(e.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40"
                      />
                      <button onClick={() => resolveDecision(d.id)} className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setResolving(null); setResolution(""); }} className="rounded-lg bg-white/10 px-3 py-2 text-white hover:bg-white/20">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResolving(d.id)}
                      className="mt-3 rounded-lg bg-blue-600/20 px-3 py-1.5 text-sm text-blue-400 hover:bg-blue-600/30"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Check className="h-5 w-5 text-green-400" /> Resolved ({resolved.length})
          </h2>
          {resolved.length > 0 && (
            <div className="space-y-3">
              {resolved.slice(0, 10).map(d => (
                <div key={d.id} className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-70">
                  <h3 className="font-medium text-white">{d.title}</h3>
                  {d.resolution && <p className="mt-1 text-sm text-green-400">→ {d.resolution}</p>}
                  <p className="mt-2 text-xs text-white/40">Resolved {new Date(d.resolvedAt!).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
