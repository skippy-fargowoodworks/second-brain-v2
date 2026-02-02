"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Msg = { id: string; author: string; message: string; createdAt: string };

export function WorkingNotes() {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [author, setAuthor] = React.useState("Jake");
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  async function refresh() {
    const res = await fetch("/api/working-messages", { cache: "no-store" });
    const data = (await res.json()) as Msg[];
    setMessages(data);
  }

  React.useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, []);

  async function send() {
    const value = text.trim();
    if (!value) return;
    setText("");

    const optimistic: Msg = {
      id: `optimistic-${Date.now()}`,
      author,
      message: value,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      const res = await fetch("/api/working-messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ author, message: value }),
      });
      if (!res.ok) throw new Error("Failed");
      await refresh();
    } catch {
      toast.error("Failed to send");
    }
  }

  return (
    <Card className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="kicker text-[11px] font-medium text-white/55">WORKING NOTES</div>
          <div className="mt-1 text-sm text-white/45">Async channel between Jake & Skippy</div>
        </div>
      </div>

      <div className="mt-4 h-[280px] space-y-2 overflow-auto rounded-xl border border-white/10 bg-slate-950/20 p-3">
        {loading ? (
          <div className="text-sm text-white/45">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-white/45">No messages yet.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-white/70">{m.author}</div>
                <div className="text-[11px] text-white/40">
                  {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="mt-2 text-sm text-white/85">{m.message}</div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <select
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/80"
        >
          <option value="Jake">Jake</option>
          <option value="Skippy">Skippy</option>
        </select>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Post a working note…"
          className="h-10 rounded-xl border-white/10 bg-white/5"
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
        />
        <Button onClick={send} className="h-10 rounded-xl bg-blue-500/70 hover:bg-blue-500">
          Send
        </Button>
      </div>
    </Card>
  );
}
