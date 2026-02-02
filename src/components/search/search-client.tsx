"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, ListTodo, NotebookText, MessagesSquare } from "lucide-react";

type Task = { id: string; title: string; description: string | null; status: string; priority: string; tags: string };
type Note = { id: string; title: string; category: string; content: string };
type Conversation = { id: string; participants: string; summary: string; keyPoints: string };

type Results = { tasks: Task[]; notes: Note[]; conversations: Conversation[] };

export function SearchClient() {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<Results>({ tasks: [], notes: [], conversations: [] });
  const [loading, setLoading] = React.useState(false);

  async function run() {
    const query = q.trim();
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      const data = (await res.json()) as { results: Results };
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="kicker text-[11px] font-medium text-white/55">SEARCH</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Search</h1>
        <p className="mt-2 text-sm text-white/55">Search across tasks, notes, and conversations.</p>
      </div>

      <Card className="glass rounded-2xl p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to search…"
              className="h-10 rounded-xl border-white/10 bg-white/5 pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") void run();
              }}
            />
          </div>
          <Button onClick={run} className="h-10 rounded-xl bg-blue-500/70 hover:bg-blue-500" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <ResultsCard title="Tasks" icon={<ListTodo className="h-4 w-4 text-blue-300" />} items={results.tasks} />
        <ResultsCard title="Notes" icon={<NotebookText className="h-4 w-4 text-emerald-300" />} items={results.notes} />
        <ResultsCard title="Conversations" icon={<MessagesSquare className="h-4 w-4 text-purple-300" />} items={results.conversations} />
      </div>
    </div>
  );
}

function ResultsCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<any>;
}) {
  return (
    <Card className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-sm font-semibold">{title}</div>
        </div>
        <Badge className="border-white/10 bg-white/5 text-white/70">{items.length}</Badge>
      </div>
      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-white/45">No results.</div>
        ) : (
          items.slice(0, 8).map((it: any) => (
            <div key={it.id} className="rounded-xl border border-white/10 bg-slate-950/20 p-3">
              <div className="text-sm font-medium text-white/85">{it.title ?? it.participants ?? it.service ?? "Item"}</div>
              <div className="mt-1 line-clamp-2 text-xs text-white/55">{it.summary ?? it.description ?? it.category ?? it.tags ?? it.keyPoints ?? ""}</div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
