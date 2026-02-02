"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, MessagesSquare } from "lucide-react";
import { format } from "date-fns";

type Conversation = {
  id: string;
  date: string;
  participants: string;
  summary: string;
  keyPoints: string;
  createdAt: string;
  updatedAt: string;
};

export function ConversationsClient({ initialConversations }: { initialConversations: Conversation[] }) {
  const [items, setItems] = React.useState<Conversation[]>(initialConversations);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Conversation | null>(null);

  async function refresh() {
    const res = await fetch("/api/conversations", { cache: "no-store" });
    const data = (await res.json()) as Conversation[];
    setItems(data);
  }

  async function remove(id: string) {
    if (!confirm("Delete this conversation log?")) return;
    const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    toast("Deleted");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="kicker text-[11px] font-medium text-white/55">CONVERSATIONS</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Conversations</h1>
          <p className="mt-2 text-sm text-white/55">Important decisions, summaries, and key points.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl bg-purple-500/70 hover:bg-purple-500">
              <Plus className="mr-2 h-4 w-4" /> New Log
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-slate-950/80 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Conversation" : "New Conversation"}</DialogTitle>
            </DialogHeader>
            <ConversationForm
              conversation={editing}
              onDone={async () => {
                setOpen(false);
                setEditing(null);
                await refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((c) => (
          <Card key={c.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4 text-purple-300" />
                  <div className="text-lg font-semibold">{c.participants || "Conversation"}</div>
                </div>
                <div className="mt-2 text-sm text-white/55">{format(new Date(c.date), "PP")}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/20 p-3 text-sm text-white/80">
              {c.summary}
            </div>

            {c.keyPoints ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/10 p-3">
                <div className="text-xs font-medium text-white/55">KEY POINTS</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/70">
                  {c.keyPoints.split("\n").filter(Boolean).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-3 text-xs text-white/40">No key points.</div>
            )}
          </Card>
        ))}

        {items.length === 0 && (
          <Card className="glass rounded-2xl p-10 text-center text-sm text-white/45">
            No conversations yet.
          </Card>
        )}
      </div>

      <div className="text-xs text-white/45">
        <Badge className="border-white/10 bg-white/5 text-white/70">Tip</Badge> Use this for decisions and constraints that should not get lost.
      </div>
    </div>
  );
}

function ConversationForm({ conversation, onDone }: { conversation: Conversation | null; onDone: () => void }) {
  const [date, setDate] = React.useState(conversation ? conversation.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [participants, setParticipants] = React.useState(conversation?.participants ?? "");
  const [summary, setSummary] = React.useState(conversation?.summary ?? "");
  const [keyPoints, setKeyPoints] = React.useState(conversation?.keyPoints ?? "");
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      const payload = {
        date: new Date(date).toISOString(),
        participants,
        summary,
        keyPoints,
      };
      const res = await fetch(conversation ? `/api/conversations/${conversation.id}` : "/api/conversations", {
        method: conversation ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast(conversation ? "Updated" : "Logged");
      onDone();
    } catch {
      toast.error("Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-white/10 bg-white/5" />
      <Input value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Participants (e.g., Jake, Skippy)" className="rounded-xl border-white/10 bg-white/5" />
      <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" className="min-h-[100px] rounded-xl border-white/10 bg-white/5" />
      <Textarea value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="Key points (one per line)" className="min-h-[120px] rounded-xl border-white/10 bg-white/5" />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" className="rounded-xl bg-white/5 hover:bg-white/10" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={pending} className="rounded-xl bg-purple-500/70 hover:bg-purple-500" onClick={submit}>
          Save
        </Button>
      </div>
    </div>
  );
}
