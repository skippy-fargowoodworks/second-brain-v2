"use client";

import { useState, useEffect } from "react";
import { Plus, Trophy, Briefcase, Heart, User, Activity } from "lucide-react";

interface Win {
  id: string;
  content: string;
  category: string;
  date: string;
}

export default function WinsPage() {
  const [wins, setWins] = useState<Win[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("personal");

  useEffect(() => {
    fetch("/api/wins").then(r => r.json()).then(setWins);
  }, []);

  const addWin = async () => {
    if (!content.trim()) return;
    const res = await fetch("/api/wins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category }),
    });
    const win = await res.json();
    setWins([win, ...wins]);
    setContent("");
    setShowForm(false);
  };

  const categoryIcons: Record<string, typeof Trophy> = {
    personal: User,
    business: Briefcase,
    family: Heart,
    health: Activity,
  };

  const categoryColors: Record<string, string> = {
    personal: "text-purple-400 bg-purple-400/10",
    business: "text-blue-400 bg-blue-400/10",
    family: "text-pink-400 bg-pink-400/10",
    health: "text-green-400 bg-green-400/10",
  };

  // Group wins by date
  const groupedWins = wins.reduce((acc, win) => {
    const date = new Date(win.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(win);
    return acc;
  }, {} as Record<string, Win[]>);

  const today = new Date().toLocaleDateString();
  const todayWins = groupedWins[today] || [];

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Wins & Gratitude</h1>
            <p className="text-white/60">Celebrate your accomplishments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            <Plus className="h-4 w-4" /> Log Win
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <textarea
              placeholder="What's your win today?..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40"
              rows={3}
            />
            <div className="flex gap-3">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="family">Family</option>
                <option value="health">Health</option>
              </select>
              <button onClick={addWin} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Log Win
              </button>
            </div>
          </div>
        )}

        <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Today&apos;s Wins</h2>
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-sm text-yellow-400">{todayWins.length}</span>
          </div>
          {todayWins.length === 0 ? (
            <p className="text-white/60">No wins logged today yet. What did you accomplish?</p>
          ) : (
            <div className="space-y-3">
              {todayWins.map(win => {
                const Icon = categoryIcons[win.category] || User;
                return (
                  <div key={win.id} className="flex items-start gap-3 rounded-lg bg-white/5 p-3">
                    <div className={`rounded-lg p-1.5 ${categoryColors[win.category]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-white">{win.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Wins</h2>
          {Object.entries(groupedWins)
            .filter(([date]) => date !== today)
            .slice(0, 7)
            .map(([date, dateWins]) => (
              <div key={date} className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-white/60">{date}</h3>
                <div className="space-y-2">
                  {dateWins.map(win => {
                    const Icon = categoryIcons[win.category] || User;
                    return (
                      <div key={win.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className={`rounded-lg p-1.5 ${categoryColors[win.category]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-white/80">{win.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
