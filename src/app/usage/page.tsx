export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addDays, format, formatDistanceToNow, startOfWeek } from "date-fns";
import { Cpu, DollarSign, ArrowUpDown, Calendar } from "lucide-react";

export default async function UsagePage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const records = await db.usage.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    orderBy: { date: "desc" },
  });

  // Calculate totals
  const totals = records.reduce(
    (acc, r) => ({
      tokensIn: acc.tokensIn + r.tokensIn,
      tokensOut: acc.tokensOut + r.tokensOut,
      cost: acc.cost + r.cost,
    }),
    { tokensIn: 0, tokensOut: 0, cost: 0 }
  );

  // Group by model
  const byModel = records.reduce((acc, r) => {
    if (!acc[r.model]) {
      acc[r.model] = { tokensIn: 0, tokensOut: 0, cost: 0, count: 0 };
    }
    acc[r.model].tokensIn += r.tokensIn;
    acc[r.model].tokensOut += r.tokensOut;
    acc[r.model].cost += r.cost;
    acc[r.model].count += 1;
    return acc;
  }, {} as Record<string, { tokensIn: number; tokensOut: number; cost: number; count: number }>);

  // Group by day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRecords = records.filter(r => r.date >= sevenDaysAgo);
  
  const byDay = recentRecords.reduce((acc, r) => {
    const day = r.date.toISOString().split("T")[0];
    if (!acc[day]) {
      acc[day] = { tokensIn: 0, tokensOut: 0, cost: 0 };
    }
    acc[day].tokensIn += r.tokensIn;
    acc[day].tokensOut += r.tokensOut;
    acc[day].cost += r.cost;
    return acc;
  }, {} as Record<string, { tokensIn: number; tokensOut: number; cost: number }>);

  const byWeek = records.reduce((acc, r) => {
    const weekStart = startOfWeek(r.date, { weekStartsOn: 1 });
    const key = weekStart.toISOString().split("T")[0];
    if (!acc[key]) {
      acc[key] = { tokensIn: 0, tokensOut: 0, cost: 0 };
    }
    acc[key].tokensIn += r.tokensIn;
    acc[key].tokensOut += r.tokensOut;
    acc[key].cost += r.cost;
    return acc;
  }, {} as Record<string, { tokensIn: number; tokensOut: number; cost: number }>);

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatCost = (n: number) => `$${n.toFixed(2)}`;
  const formatDayLabel = (day: string) => format(new Date(day), "MMM d");
  const formatWeekLabel = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = addDays(start, 6);
    return `${format(start, "MMM d")} - ${format(end, "MMM d")}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="kicker text-[11px] font-medium text-white/55 mb-2">AI USAGE</div>
        <h1 className="text-3xl font-bold text-white/95">Usage & Costs</h1>
        <p className="text-white/55 mt-1">Last 30 days of AI token usage and costs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="kicker text-[11px] font-medium text-white/55">TOTAL COST</div>
              <div className="mt-1 text-2xl font-bold text-white/95">{formatCost(totals.cost)}</div>
            </div>
            <div className="rounded-xl bg-emerald-500/20 p-3">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="kicker text-[11px] font-medium text-white/55">TOKENS IN</div>
              <div className="mt-1 text-2xl font-bold text-white/95">{formatTokens(totals.tokensIn)}</div>
            </div>
            <div className="rounded-xl bg-blue-500/20 p-3">
              <ArrowUpDown className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="kicker text-[11px] font-medium text-white/55">TOKENS OUT</div>
              <div className="mt-1 text-2xl font-bold text-white/95">{formatTokens(totals.tokensOut)}</div>
            </div>
            <div className="rounded-xl bg-purple-500/20 p-3">
              <ArrowUpDown className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="kicker text-[11px] font-medium text-white/55">API CALLS</div>
              <div className="mt-1 text-2xl font-bold text-white/95">{records.length}</div>
            </div>
            <div className="rounded-xl bg-amber-500/20 p-3">
              <Cpu className="h-5 w-5 text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* By Model */}
        <Card className="glass rounded-2xl p-5">
          <div className="mb-4">
            <div className="kicker text-[11px] font-medium text-white/55">USAGE BY MODEL</div>
            <div className="mt-1 text-sm text-white/45">Token usage per AI model</div>
          </div>
          <div className="space-y-3">
            {Object.entries(byModel).length === 0 ? (
              <div className="text-white/45 text-sm">No usage data yet</div>
            ) : (
              Object.entries(byModel)
                .sort((a, b) => b[1].cost - a[1].cost)
                .map(([model, stats]) => (
                  <div key={model} className="rounded-xl border border-white/10 bg-slate-950/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/85 font-medium">{model}</span>
                      <Badge className="border-white/10 bg-white/5 text-emerald-400">
                        {formatCost(stats.cost)}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-white/55">
                      <span>In: {formatTokens(stats.tokensIn)}</span>
                      <span>Out: {formatTokens(stats.tokensOut)}</span>
                      <span>{stats.count} calls</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>

        {/* By Day */}
        <Card className="glass rounded-2xl p-5">
          <div className="mb-4">
            <div className="kicker text-[11px] font-medium text-white/55">DAILY USAGE</div>
            <div className="mt-1 text-sm text-white/45">Last 7 days</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(byDay).length === 0 ? (
              <div className="text-white/45 text-sm">No usage data yet</div>
            ) : (
              Object.entries(byDay)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .slice(0, 7)
                .map(([day, stats]) => (
                  <div key={day} className="rounded-xl border border-white/10 bg-slate-950/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-white/45" />
                        <span className="text-white/85">{formatDayLabel(day)}</span>
                      </div>
                      <Badge className="border-white/10 bg-white/5 text-emerald-400">
                        {formatCost(stats.cost)}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-white/55">
                      <span>In: {formatTokens(stats.tokensIn)}</span>
                      <span>Out: {formatTokens(stats.tokensOut)}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card className="glass rounded-2xl p-5">
        <div className="mb-4">
          <div className="kicker text-[11px] font-medium text-white/55">WEEKLY SUMMARY</div>
          <div className="mt-1 text-sm text-white/45">Totals by week</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(byWeek).length === 0 ? (
            <div className="text-white/45 text-sm">No usage data yet</div>
          ) : (
            Object.entries(byWeek)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .slice(0, 6)
              .map(([weekStart, stats]) => (
                <div key={weekStart} className="rounded-xl border border-white/10 bg-slate-950/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/85">{formatWeekLabel(weekStart)}</span>
                    <Badge className="border-white/10 bg-white/5 text-emerald-400">
                      {formatCost(stats.cost)}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-white/55">
                    <span>In: {formatTokens(stats.tokensIn)}</span>
                    <span>Out: {formatTokens(stats.tokensOut)}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="glass rounded-2xl p-5">
        <div className="mb-4">
          <div className="kicker text-[11px] font-medium text-white/55">RECENT API CALLS</div>
          <div className="mt-1 text-sm text-white/45">Latest 10 usage records</div>
        </div>
        <div className="space-y-2">
          <div className="hidden md:grid md:grid-cols-12 text-[11px] uppercase tracking-wide text-white/35 px-3">
            <div className="md:col-span-4">Task</div>
            <div className="md:col-span-2">Model</div>
            <div className="md:col-span-2">Tokens In</div>
            <div className="md:col-span-2">Tokens Out</div>
            <div className="md:col-span-1">Cost</div>
            <div className="md:col-span-1 text-right">When</div>
          </div>
          {records.slice(0, 10).map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-slate-950/20 p-3">
              <div className="grid gap-2 md:grid-cols-12 md:items-center">
                <div className="md:col-span-4">
                  <div className="text-white/90 font-medium">{r.task || "Unlabeled task"}</div>
                  <div className="md:hidden text-white/45 text-xs mt-1">
                    {r.model} ({r.provider})
                    {r.sessionKey ? ` · ${r.sessionKey}` : ""}
                  </div>
                  <div className="hidden md:block text-white/45 text-xs mt-1">
                    {r.provider}
                    {r.sessionKey ? ` · ${r.sessionKey}` : ""}
                  </div>
                </div>
                <div className="hidden md:block md:col-span-2 text-white/75">{r.model}</div>
                <div className="md:col-span-2 text-white/75">{formatTokens(r.tokensIn)}</div>
                <div className="md:col-span-2 text-white/75">{formatTokens(r.tokensOut)}</div>
                <div className="md:col-span-1 text-emerald-400">{formatCost(r.cost)}</div>
                <div className="md:col-span-1 text-white/35 md:text-right">
                  {formatDistanceToNow(r.date, { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="text-white/45 text-sm">No usage data yet. Usage will appear here as Skippy logs API calls.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
