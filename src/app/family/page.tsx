"use client";

import { useState, useEffect } from "react";
import { Plus, Heart, Cake, CalendarHeart, Calendar } from "lucide-react";

interface FamilyEvent {
  id: string;
  name: string;
  person: string | null;
  type: string;
  date: string;
  month: number;
  day: number;
  recurring: boolean;
  notes: string | null;
}

export default function FamilyPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [upcoming, setUpcoming] = useState<FamilyEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [person, setPerson] = useState("");
  const [type, setType] = useState<"birthday" | "anniversary" | "event">("birthday");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("/api/family").then(r => r.json()).then(setEvents);
    fetch("/api/family?upcoming=true").then(r => r.json()).then(setUpcoming);
  }, []);

  const addEvent = async () => {
    if (!name.trim() || !date) return;
    const res = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, person, type, date }),
    });
    const event = await res.json();
    setEvents([...events, event]);
    setName("");
    setPerson("");
    setDate("");
    setShowForm(false);
    // Refresh upcoming
    fetch("/api/family?upcoming=true").then(r => r.json()).then(setUpcoming);
  };

  const typeIcons: Record<string, typeof Heart> = {
    birthday: Cake,
    anniversary: CalendarHeart,
    event: Calendar,
  };

  const typeColors: Record<string, string> = {
    birthday: "text-pink-400 bg-pink-400/10",
    anniversary: "text-red-400 bg-red-400/10",
    event: "text-blue-400 bg-blue-400/10",
  };

  const getDaysUntil = (month: number, day: number) => {
    const today = new Date();
    const thisYear = today.getFullYear();
    let eventDate = new Date(thisYear, month - 1, day);
    if (eventDate < today) {
      eventDate = new Date(thisYear + 1, month - 1, day);
    }
    const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Family Dashboard</h1>
            <p className="text-white/60">Important dates and events</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                placeholder="Event name..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
              />
              <input
                type="text"
                placeholder="Person (optional)..."
                value={person}
                onChange={e => setPerson(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40"
              />
              <select
                value={type}
                onChange={e => setType(e.target.value as "birthday" | "anniversary" | "event")}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              >
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="event">Event</option>
              </select>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white"
              />
            </div>
            <button onClick={addEvent} className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              Add Event
            </button>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Heart className="h-5 w-5 text-pink-400" /> Coming Up
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {upcoming.map(e => {
                const days = getDaysUntil(e.month, e.day);
                const Icon = typeIcons[e.type] || Calendar;
                return (
                  <div key={e.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${typeColors[e.type]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{e.name}</h3>
                        <p className="text-sm text-white/60">
                          {e.month}/{e.day} · {days === 0 ? "Today!" : days === 1 ? "Tomorrow!" : `${days} days`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">All Events</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {events.map(e => {
              const Icon = typeIcons[e.type] || Calendar;
              return (
                <div key={e.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${typeColors[e.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{e.name}</h3>
                      <p className="text-sm text-white/60">
                        {new Date(e.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                        {e.recurring && " (yearly)"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
