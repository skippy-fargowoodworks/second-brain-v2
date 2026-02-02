import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function PipelineVelocity({
  counts,
}: {
  counts: { backlog: number; in_progress: number; review: number; done: number };
}) {
  return (
    <Card className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="kicker text-[11px] font-medium text-white/55">PIPELINE VELOCITY</div>
          <div className="mt-1 text-sm text-white/45">LIVE METRICS</div>
        </div>
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200">SYNCED</Badge>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3 text-center">
        <Stage label="Backlog" value={counts.backlog} tone="border-blue-500/20 bg-blue-500/10" />
        <Stage label="In Progress" value={counts.in_progress} tone="border-purple-500/20 bg-purple-500/10" />
        <Stage label="Review" value={counts.review} tone="border-sky-500/20 bg-sky-500/10" />
        <Stage label="Done" value={counts.done} tone="border-emerald-500/20 bg-emerald-500/10" />
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-white/45">
        <span>Backlog  In Progress  Review  Done</span>
        <span>{counts.done} completed</span>
      </div>
    </Card>
  );
}

function Stage({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-[11px] font-medium text-white/60">{label.toUpperCase()}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
