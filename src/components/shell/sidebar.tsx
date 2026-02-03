"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ListTodo,
  StickyNote,
  Lock,
  MessagesSquare,
  Activity,
  DollarSign,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/working-notes", label: "Working Notes", icon: Activity },
  { href: "/usage", label: "AI Usage", icon: DollarSign },
];

export function Sidebar({ status }: { status: "working" | "idle" }) {
  const statusLabel = status === "working" ? "Working" : "Idle";
  const statusClass =
    status === "working"
      ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]"
      : "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.45)]";

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-[76px] border-r border-white/10 bg-slate-950/40 backdrop-blur-xl">
      <div className="flex h-full flex-col items-center gap-2 py-4">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold tracking-widest text-white/80">
          SB
        </div>

        <TooltipProvider delayDuration={150}>
          <nav className="flex flex-1 flex-col items-center gap-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/0 bg-white/0 text-white/70 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="border-white/10 bg-slate-900/90 text-white">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col items-center gap-2 pb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusClass}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-white/10 bg-slate-900/90 text-white">
                {statusLabel}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </aside>
  );
}
