import type { ReactNode } from "react";

export function StatsCard({
  icon,
  number,
  label,
  accentClassName = "",
}: {
  icon: ReactNode;
  number: string | number;
  label: string;
  accentClassName?: string;
}) {
  return (
    <div className="glass-card group relative overflow-hidden rounded-2xl p-5">
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl opacity-30 ${accentClassName}`}
      />
      <div className="relative flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight text-slate-50">
            {number}
          </div>
          <div className="text-sm text-slate-300/90">{label}</div>
        </div>
      </div>
    </div>
  );
}
