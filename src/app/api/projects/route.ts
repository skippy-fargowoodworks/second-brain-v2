import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const projects = await db.project.findMany({
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
    include: {
      tasks: {
        select: { id: true, status: true },
      },
    },
  });

  // Add task counts
  const projectsWithCounts = projects.map(p => ({
    ...p,
    taskCount: p.tasks.length,
    completedCount: p.tasks.filter(t => t.status === "done").length,
    progress: p.tasks.length > 0 
      ? Math.round((p.tasks.filter(t => t.status === "done").length / p.tasks.length) * 100)
      : 0,
  }));

  return NextResponse.json(projectsWithCounts);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, description, priority, startDate, targetDate } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const project = await db.project.create({
    data: {
      name,
      description,
      priority: priority || "medium",
      startDate: startDate ? new Date(startDate) : new Date(),
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  await db.activity.create({
    data: { entity: "project", entityId: project.id, message: `Created project: ${name}` },
  });

  return NextResponse.json(project, { status: 201 });
}
