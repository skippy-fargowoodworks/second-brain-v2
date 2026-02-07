"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, ListTodo, NotebookText, MessagesSquare, HelpCircle, Activity } from "lucide-react";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  snippet: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  task: <ListTodo className="h-4 w-4 text-blue-400" />,
  note: <NotebookText className="h-4 w-4 text-emerald-400" />,
  conversation: <MessagesSquare className="h-4 w-4 text-purple-400" />,
  decision: <HelpCircle className="h-4 w-4 text-yellow-400" />,
  working_message: <Activity className="h-4 w-4 text-pink-400" />,
};

const typeColors: Record<string, string> = {
  task: "bg-blue-400/10 text-blue-400",
  note: "bg-emerald-400/10 text-emerald-400",
  conversation: "bg-purple-400/10 text-purple-400",
  decision: "bg-yellow-400/10 text-yellow-400",
  working_message: "bg-pink-400/10 text-pink-400",
};

export function SearchClient() {
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);

  async function run() {
    const query = q.trim();
    if (query.length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      const data = await res.json();
      setResults(data.results || []);
    } finally {
      setLoading(false);
    }
  }

  // Group results by type
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="space-y-6">
      <div>
        <div className="kicker text-[11px] font-medium text-white/55">SEARCH</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Search Everything</h1>
        <p className="mt-2 text-sm text-white/55">Search across tasks, notes, conversations, decisions, and working notes.</p>
      </div>

      <Card className="glass rounded-2xl p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tasks, notes, decisions..."
              className="h-10 rounded-xl border-white/10 bg-white/5 pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") void run();
              }}
            />
          </div>
          <Button onClick={run} className="h-10 rounded-xl bg-blue-500/70 hover:bg-blue-500" disabled={loading || q.trim().length < 2}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>
      </Card>

      {searched && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="border-white/10 bg-white/5 text-white/70">{results.length} results</Badge>
            {Object.entries(grouped).map(([type, items]) => (
              <Badge key={type} className={`border-0 ${typeColors[type] || "bg-white/10 text-white/70"}`}>
                {type}: {items.length}
              </Badge>
            ))}
          </div>

          {results.length === 0 ? (
            <Card className="glass rounded-2xl p-8 text-center">
              <p className="text-white/55">No results found for &quot;{q}&quot;</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <Card key={`${r.type}-${r.id}`} className="glass rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${typeColors[r.type] || "bg-white/10"}`}>
                      {typeIcons[r.type] || <SearchIcon className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{r.title}</span>
                        <Badge className={`border-0 text-[10px] ${typeColors[r.type] || "bg-white/10 text-white/70"}`}>
                          {r.type}
                        </Badge>
                      </div>
                      {r.snippet && (
                        <p className="mt-1 text-sm text-white/55 line-clamp-2">{r.snippet}</p>
                      )}
                      <p className="mt-1 text-xs text-white/35">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <Card className="glass rounded-2xl p-8 text-center">
          <SearchIcon className="mx-auto h-12 w-12 text-white/20" />
          <p className="mt-4 text-white/55">Enter a search term to find anything in your Second Brain</p>
        </Card>
      )}
    </div>
  );
}
