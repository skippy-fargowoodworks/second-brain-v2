import { format } from "date-fns";
import { SendHorizontal } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export default async function WorkingNotesPage() {
  const messages = await prisma.workingMessage.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Working Notes
        </h1>
        <p className="mt-2 text-sm text-slate-300/90">
          Live collaboration thread between Jake and Skippy.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="glass-card rounded-2xl p-6">
          <ScrollArea className="h-[420px] pr-3">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
                  No working notes yet. Start the thread below.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.author.toLowerCase() === "jake" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl border px-4 py-3 text-sm ${
                        msg.author.toLowerCase() === "jake"
                          ? "border-blue-400/30 bg-blue-500/10 text-blue-100"
                          : "border-purple-400/30 bg-purple-500/10 text-purple-100"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {msg.author}
                      </div>
                      <div className="mt-2 whitespace-pre-line text-sm text-white/90">
                        {msg.message}
                      </div>
                      <div className="mt-2 text-[11px] text-white/40">
                        {format(msg.createdAt, "MMM d, HH:mm")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-slate-100">New Note</h2>
          <p className="mt-1 text-sm text-slate-300/90">
            Capture what you're doing right now.
          </p>

          <div className="mt-5 space-y-4">
            <Textarea
              placeholder="Share a progress update, blocker, or next step..."
              className="min-h-[180px] border-white/10 bg-white/5 text-slate-100"
            />
            <Button className="w-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white">
              <SendHorizontal className="h-4 w-4" />
              Send Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
