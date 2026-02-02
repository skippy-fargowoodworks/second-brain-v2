"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StatusToggle({ initial }: { initial: "working" | "idle" }) {
  const [status, setStatus] = React.useState(initial);
  const [pending, setPending] = React.useState(false);

  async function set(next: "working" | "idle") {
    setPending(true);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus(next);
      toast("Status updated", { description: next.toUpperCase() });
    } catch {
      toast.error("Failed to update status");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-white/50">Skippy</div>
      <div className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status === "working" ? "bg-purple-500/15 text-purple-200" : "bg-white/5 text-white/70"}`}>
        {status === "working" ? "WORKING" : "IDLE"}
      </div>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => set(status === "working" ? "idle" : "working")}
        className="h-8 rounded-xl bg-white/5 hover:bg-white/10"
      >
        Toggle
      </Button>
    </div>
  );
}
