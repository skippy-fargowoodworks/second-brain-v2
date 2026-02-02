"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, NotebookText, Search as SearchIcon } from "lucide-react";

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  createdAt: string;
};

export function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = React.useState<Note[]>(initialNotes);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Note | null>(null);

  async function refresh() {
    const res = await fetch("/api/notes", { cache: "no-store" });
    const data = (await res.json()) as Note[];
    setNotes(data);
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    toast("Deleted");
    await refresh();
  }

  const filtered = notes.filter((n) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="kicker text-[11px] font-medium text-white/55">NOTES</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Notes</h1>
          <p className="mt-2 text-sm text-white/55">Markdown knowledge base entries with categories.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl bg-emerald-500/70 hover:bg-emerald-500">
              <Plus className="mr-2 h-4 w-4" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-slate-950/80 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Note" : "New Note"}</DialogTitle>
            </DialogHeader>
            <NoteForm
              note={editing}
              onDone={async () => {
                setOpen(false);
                setEditing(null);
                await refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="h-10 rounded-xl border-white/10 bg-white/5 pl-10"
          />
        </div>
        <Badge className="border-white/10 bg-white/5 text-white/70">{filtered.length} results</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((n) => (
          <Card key={n.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <NotebookText className="h-4 w-4 text-emerald-300" />
                  <div className="text-lg font-semibold">{n.title}</div>
                </div>
                <div className="mt-2">
                  <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200">{n.category}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    setEditing(n);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                  onClick={() => remove(n.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="prose prose-invert mt-4 max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{n.content}</ReactMarkdown>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="glass rounded-2xl p-10 text-center text-sm text-white/45">
            No notes yet.
          </Card>
        )}
      </div>
    </div>
  );
}

function NoteForm({ note, onDone }: { note: Note | null; onDone: () => void }) {
  const [title, setTitle] = React.useState(note?.title ?? "");
  const [category, setCategory] = React.useState(note?.category ?? "General");
  const [content, setContent] = React.useState(note?.content ?? "");
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      const payload = { title, category, content };
      const res = await fetch(note ? `/api/notes/${note.id}` : "/api/notes", {
        method: note ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast(note ? "Note updated" : "Note created");
      onDone();
    } catch {
      toast.error("Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-xl border-white/10 bg-white/5" />
      <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded-xl border-white/10 bg-white/5" />
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Markdown content" className="min-h-[180px] rounded-xl border-white/10 bg-white/5" />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" className="rounded-xl bg-white/5 hover:bg-white/10" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={pending} className="rounded-xl bg-emerald-500/70 hover:bg-emerald-500" onClick={submit}>
          Save
        </Button>
      </div>
    </div>
  );
}
