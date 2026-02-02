"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  MessagesSquare,
  StickyNote,
  Lock,
  Activity,
} from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/working-notes", label: "Working Notes", icon: Activity },
] as const;

export function Sidebar({ status = "idle" }: { status?: "working" | "idle" }) {
  const pathname = usePathname();
  const statusLabel = status === "working" ? "WORKING" : "IDLE";
  const statusClass =
    status === "working"
      ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
      : "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.6)]";

  return (
    <aside className="relative hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/30 p-5 backdrop-blur-xl lg:block">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/60 to-purple-500/60 ring-1 ring-white/10">
          <span className="text-sm font-semibold tracking-widest text-white">2</span>
        </div>
        <div className="leading-tight">
          <div className="text-xs tracking-[0.3em] text-slate-400">2ND</div>
          <div className="text-lg font-semibold tracking-tight text-slate-100">
            BRAIN
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/10 text-slate-50 ring-1 ring-white/15"
                  : "text-slate-300 hover:bg-white/5 hover:text-slate-50"
              }`}
            >
              <Icon className="h-4 w-4 opacity-90" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-5 left-5 right-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-slate-400">Status</div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${statusClass}`} />
            <span className="text-sm text-slate-200">{statusLabel}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
