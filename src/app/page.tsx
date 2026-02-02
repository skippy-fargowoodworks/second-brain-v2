import { db } from "@/lib/db";
import { SystemHeader } from "@/components/dashboard/system-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PipelineVelocity } from "@/components/dashboard/pipeline";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { WorkingNotes } from "@/components/dashboard/working-notes";
import { StatusToggle } from "@/components/dashboard/status-toggle";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ListTodo, Workflow, AlertTriangle, NotebookText } from "lucide-react";

export default async function DashboardPage() {
  const statusRow = (await db.status.findFirst()) ?? (await db.status.create({ data: { status: "idle" } }));

  const [totalTasks, inProgress, critical, notesCount, pipeline, activity] = await Promise.all([
    db.task.count(),
    db.task.count({ where: { status: "in_progress" } }),
    db.task.count({ where: { priority: "critical", status: { not: "done" } } }),
    db.note.count(),
    Promise.all([
      db.task.count({ where: { status: "backlog" } }),
      db.task.count({ where: { status: "in_progress" } }),
      db.task.count({ where: { status: "review" } }),
      db.task.count({ where: { status: "done" } }),
    ]),
    db.activity.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const [backlog, in_progress, review, done] = pipeline;
  const throughput = totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100);

  return (
    <div className="space-y-8">
      <SystemHeader />

      <div className="flex items-center justify-between">
        <StatusToggle initial={statusRow.status} />
        <div className="hidden items-center gap-2 md:flex">
          <Badge className="border-white/10 bg-white/5 text-white/70">LIVE</Badge>
          <div className="text-xs text-white/45">Updated {formatDistanceToNow(statusRow.updatedAt)} ago</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active Tasks" value={totalTasks} tone="blue" icon={<ListTodo className="h-5 w-5" />} hint="Total tracked" />
        <StatCard label="In Progress" value={inProgress} tone="purple" icon={<Workflow className="h-5 w-5" />} hint="Currently executing" />
        <StatCard label="Critical" value={critical} tone="amber" icon={<AlertTriangle className="h-5 w-5" />} hint="Needs attention" />
        <StatCard label="Notes" value={notesCount} tone="green" icon={<NotebookText className="h-5 w-5" />} hint="Knowledge base" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PipelineVelocity counts={{ backlog, in_progress, review, done }} />

          <Card className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="kicker text-[11px] font-medium text-white/55">WEEKLY THROUGHPUT</div>
                <div className="mt-1 text-sm text-white/45">Completion trend</div>
              </div>
              <div className="text-sm font-semibold text-white/80">{throughput}%</div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500/70 via-purple-500/60 to-emerald-500/60" style={{ width: `${throughput}%` }} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <QuickActions />

          <Card className="glass rounded-2xl p-5">
            <div>
              <div className="kicker text-[11px] font-medium text-white/55">RECENT ACTIVITY</div>
              <div className="mt-1 text-sm text-white/45">Latest events</div>
            </div>
            <div className="mt-4 space-y-2">
              {activity.length === 0 ? (
                <div className="text-sm text-white/45">No activity yet.</div>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className="rounded-xl border border-white/10 bg-slate-950/20 p-3">
                    <div className="text-xs text-white/50">{a.entity.toUpperCase()}</div>
                    <div className="mt-1 text-sm text-white/85">{a.message}</div>
                    <div className="mt-2 text-[11px] text-white/40">
                      {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <WorkingNotes />
    </div>
  );
}
