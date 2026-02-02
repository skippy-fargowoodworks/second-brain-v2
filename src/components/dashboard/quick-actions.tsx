"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, NotebookText, KeyRound, Search } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card className="glass rounded-2xl p-5">
      <div className="kicker text-[11px] font-medium text-white/55">QUICK ACTIONS</div>

      <div className="mt-4 grid gap-2">
        <Link href="/tasks">
          <Button className="w-full justify-between rounded-xl bg-blue-500/15 text-blue-100 hover:bg-blue-500/20">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Task
            </span>
            <span className="text-xs text-blue-100/60">N</span>
          </Button>
        </Link>
        <Link href="/notes">
          <Button className="w-full justify-between rounded-xl bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20">
            <span className="flex items-center gap-2">
              <NotebookText className="h-4 w-4" /> New Note
            </span>
            <span className="text-xs text-emerald-100/60">S</span>
          </Button>
        </Link>
        <Link href="/vault">
          <Button variant="secondary" className="w-full justify-between rounded-xl bg-white/5 hover:bg-white/8">
            <span className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Vault Entry
            </span>
            <span className="text-xs text-white/50">+</span>
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="secondary" className="w-full justify-between rounded-xl bg-white/5 hover:bg-white/8">
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" /> Search
            </span>
            <span className="text-xs text-white/50">/</span>
          </Button>
        </Link>
        <Button
          variant="secondary"
          className="mt-2 w-full rounded-xl bg-white/5 hover:bg-white/8"
          onClick={() => toast("Synced.", { description: "All systems nominal." })}
        >
          Run Sync
        </Button>
      </div>
    </Card>
  );
}
