"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle2, HelpCircle, StickyNote, Trophy, MessageSquare, RefreshCw } from "lucide-react";

interface Report {
  period: { start: string; end: string };
  stats: {
    tasksCompleted: number;
    tasksCreated: number;
    decisionsResolved: number;
    decisionsPending: number;
    notesCreated: number;
    winsLogged: number;
    conversations: number;
  };
  markdown: string;
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const loadReport = async (start?: string, end?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const res = await fetch(`/api/report?${params}`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, []);

  const generateCustom = () => {
    if (customStart && customEnd) {
      loadReport(customStart, customEnd);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (!report) return null;

  const statCards = [
    { label: "Tasks Completed", value: report.stats.tasksCompleted, icon: CheckCircle2, color: "text-green-400 bg-green-400/10" },
    { label: "Tasks Created", value: report.stats.tasksCreated, icon: FileText, color: "text-blue-400 bg-blue-400/10" },
    { label: "Decisions Resolved", value: report.stats.decisionsResolved, icon: HelpCircle, color: "text-purple-400 bg-purple-400/10" },
    { label: "Decisions Pending", value: report.stats.decisionsPending, icon: HelpCircle, color: "text-yellow-400 bg-yellow-400/10" },
    { label: "Notes Created", value: report.stats.notesCreated, icon: StickyNote, color: "text-pink-400 bg-pink-400/10" },
    { label: "Wins Logged", value: report.stats.winsLogged, icon: Trophy, color: "text-yellow-400 bg-yellow-400/10" },
    { label: "Conversations", value: report.stats.conversations, icon: MessageSquare, color: "text-cyan-400 bg-cyan-400/10" },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Weekly Report</h1>
          <p className="text-white/60">
            {new Date(report.period.start).toLocaleDateString()} — {new Date(report.period.end).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-white/60">Custom range:</span>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
            />
            <span className="text-white/40">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
            />
            <button
              onClick={generateCustom}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              Generate
            </button>
            <button
              onClick={() => loadReport()}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
            >
              This Week
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {statCards.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className={`mb-2 inline-flex rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Full Report</h2>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap rounded-lg bg-white/5 p-4 text-sm text-white/80">
              {report.markdown}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
