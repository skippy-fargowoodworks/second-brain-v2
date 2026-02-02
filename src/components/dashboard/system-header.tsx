import { Cpu, HardDrive, Activity, Dot } from "lucide-react";

export function SystemHeader() {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-emerald-200/90">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="kicker">SYSTEM ONLINE</span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-white/60">Welcome back. Here&apos;s your overview.</p>
      </div>

      <div className="hidden w-[340px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:block">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/20 p-3">
            <div className="flex items-center gap-2 text-[11px] text-white/55">
              <Cpu className="h-3.5 w-3.5" /> CPU LOAD
            </div>
            <div className="mt-2 text-lg font-semibold">12%</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/20 p-3">
            <div className="flex items-center gap-2 text-[11px] text-white/55">
              <HardDrive className="h-3.5 w-3.5" /> MEMORY
            </div>
            <div className="mt-2 text-lg font-semibold">68%</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/20 p-3">
            <div className="flex items-center gap-2 text-[11px] text-white/55">
              <Activity className="h-3.5 w-3.5" /> NETWORK
            </div>
            <div className="mt-2 text-lg font-semibold">OK</div>
          </div>
        </div>
      </div>
    </div>
  );
}
