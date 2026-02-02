import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "blue",
  hint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "blue" | "purple" | "amber" | "green";
  hint?: string;
}) {
  const toneStyles: Record<string, string> = {
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    green: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <Card className="glass rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-white/55">{label.toUpperCase()}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className={cn("rounded-xl border p-2", toneStyles[tone])}>{icon}</div>
      </div>
      <div className="mt-3 text-xs text-white/45">{hint ?? "Live"}</div>
    </Card>
  );
}
