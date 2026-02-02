export const dynamic = "force-dynamic";
export const revalidate = 0;

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, StickyNote } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default async function NotesPage() {
  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const selected = notes[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
            Notes
          </h1>
          <p className="mt-2 text-sm text-slate-300/90">
            Markdown-ready knowledge capture with tags.
          </p>
        </div>

        <Button className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </header>

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
                  <div
                    key={note.id}
                    className={`rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition ${
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
                  </div>
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
    </div>
  );
}
