import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: [{ status: "asc" }, { priority: "asc" }],
      },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...project,
    taskCount: project.tasks.length,
    completedCount: project.tasks.filter(t => t.status === "done").length,
    progress: project.tasks.length > 0
      ? Math.round((project.tasks.filter(t => t.status === "done").length / project.tasks.length) * 100)
      : 0,
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, description, status, priority, startDate, targetDate } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (startDate !== undefined) updateData.startDate = new Date(startDate);
  if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;

  const project = await db.project.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(project);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Remove project reference from tasks first
  await db.task.updateMany({ where: { projectId: id }, data: { projectId: null } });
  await db.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
