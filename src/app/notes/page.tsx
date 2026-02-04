export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { NotesLibraryClient } from "@/components/notes/notes-library-client";

export default async function NotesPage() {
  const notes = await prisma.note.findMany({
    orderBy: { updatedAt: "desc" },
  });

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

      <NotesLibraryClient initialNotes={notes} />
    </div>
  );
}
