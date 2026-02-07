"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Flame, X } from "lucide-react";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  streak: number;
  longestStreak: number;
  active: boolean;
  logs: HabitLog[];
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");

  useEffect(() => {
    fetch("/api/habits").then(r => r.json()).then(setHabits);
  }, []);

  const addHabit = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, frequency }),
    });
    const habit = await res.json();
    setHabits([...habits, { ...habit, logs: [] }]);
    setName("");
    setDescription("");
    setShowForm(false);
  };

  const toggleToday = async (habitId: string, completed: boolean) => {
    await fetch(`/api/habits/${habitId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    // Refresh
    const res = await fetch("/api/habits");
    setHabits(await res.json());
  };

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0];
    return habit.logs.some(l => l.date.startsWith(today) && l.completed);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const days = getLast7Days();

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Habit Tracker</h1>
            <p className="text-white/60">Build consistency, one day at a time</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" /> Add Habit
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <input
              type="text"
              placeholder="Habit name..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
            />
            <input
              type="text"
              placeholder="Description (optional)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
            />
            <div className="flex gap-3">
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <button onClick={addHabit} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                Add
              </button>
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            No habits yet. Start building good habits!
          </div>
        ) : (
          <div className="space-y-4">
            {habits.filter(h => h.active).map(habit => {
              const completed = isCompletedToday(habit);
              return (
                <div key={habit.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleToday(habit.id, !completed)}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition ${
                          completed
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : "border-white/20 bg-white/5 text-white/40 hover:border-white/40"
                        }`}
                      >
                        {completed ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                      </button>
                      <div>
                        <h3 className="font-medium text-white">{habit.name}</h3>
                        {habit.description && <p className="text-sm text-white/60">{habit.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-400" />
                      <span className="text-lg font-bold text-white">{habit.streak}</span>
                      <span className="text-sm text-white/40">day streak</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {days.map(day => {
                      const log = habit.logs.find(l => l.date.startsWith(day));
                      const done = log?.completed;
                      return (
                        <div
                          key={day}
                          className={`h-8 flex-1 rounded ${done ? "bg-green-500" : "bg-white/10"}`}
                          title={day}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-white/40">
                    <span>7 days ago</span>
                    <span>Today</span>
                  </div>
                  {habit.longestStreak > 0 && (
                    <p className="mt-2 text-xs text-white/40">Best streak: {habit.longestStreak} days</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
