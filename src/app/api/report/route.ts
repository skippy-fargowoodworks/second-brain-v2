import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  // Default to current week (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const start = startParam 
    ? new Date(startParam) 
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  
  const end = endParam 
    ? new Date(endParam) 
    : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Gather stats
  const [tasksCompleted, tasksCreated, decisionsResolved, decisionsPending, notesCreated, winsLogged, conversations] = await Promise.all([
    db.task.count({ where: { status: "done", updatedAt: { gte: start, lt: end } } }),
    db.task.count({ where: { createdAt: { gte: start, lt: end } } }),
    db.decision.count({ where: { status: "resolved", resolvedAt: { gte: start, lt: end } } }),
    db.decision.count({ where: { status: "pending" } }),
    db.note.count({ where: { createdAt: { gte: start, lt: end } } }),
    db.win.count({ where: { createdAt: { gte: start, lt: end } } }),
    db.conversation.count({ where: { createdAt: { gte: start, lt: end } } }),
  ]);

  // Get recent completed tasks
  const recentTasks = await db.task.findMany({
    where: { status: "done", updatedAt: { gte: start, lt: end } },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  // Get resolved decisions
  const recentDecisions = await db.decision.findMany({
    where: { status: "resolved", resolvedAt: { gte: start, lt: end } },
    orderBy: { resolvedAt: "desc" },
    take: 5,
  });

  // Get wins
  const recentWins = await db.win.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Generate markdown report
  const report = `# Weekly Report
**Period:** ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}

## Summary
- **Tasks Completed:** ${tasksCompleted}
- **Tasks Created:** ${tasksCreated}
- **Decisions Resolved:** ${decisionsResolved}
- **Decisions Pending:** ${decisionsPending}
- **Notes Created:** ${notesCreated}
- **Wins Logged:** ${winsLogged}
- **Conversations:** ${conversations}

## Tasks Completed
${recentTasks.map(t => `- ${t.title}`).join('\n') || '- None this period'}

## Decisions Made
${recentDecisions.map(d => `- **${d.title}**: ${d.resolution || 'No resolution recorded'}`).join('\n') || '- None this period'}

## Wins & Accomplishments
${recentWins.map(w => `- ${w.content}`).join('\n') || '- None logged'}
`;

  return NextResponse.json({
    period: { start: start.toISOString(), end: end.toISOString() },
    stats: {
      tasksCompleted,
      tasksCreated,
      decisionsResolved,
      decisionsPending,
      notesCreated,
      winsLogged,
      conversations,
    },
    recentTasks,
    recentDecisions,
    recentWins,
    markdown: report,
  });
}
