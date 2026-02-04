"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StickyNote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
};

export function NotesLibraryClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes] = React.useState<Note[]>(initialNotes);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    initialNotes[0]?.id ?? null
  );

  const selected = React.useMemo(
    () => notes.find((note) => note.id === selectedId) ?? notes[0] ?? null,
    [notes, selectedId]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <StickyNote className="h-5 w-5 text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-100">Library</h2>
        </div>

        <Separator className="my-4 bg-white/10" />

        <ScrollArea className="h-[420px] pr-3">
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                Notes appear here once created.
              </div>
            ) : (
              notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition ${
                    selected?.id === note.id
                      ? "border-purple-400/40 bg-white/10"
                      : "hover:border-white/20"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-100">
                    {note.title}
                  </div>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className="bg-white/10 text-slate-200"
                    >
                      {note.category}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              {selected?.title ?? "Markdown Preview"}
            </h2>
            <p className="mt-1 text-sm text-slate-300/90">
              Rendered markdown content.
            </p>
          </div>
        </div>

        <Separator className="my-4 bg-white/10" />

        {selected ? (
          <div className="markdown-body text-sm text-slate-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {selected.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
            Create a note to see markdown rendering.
          </div>
        )}
      </div>
    </div>
  );
}
