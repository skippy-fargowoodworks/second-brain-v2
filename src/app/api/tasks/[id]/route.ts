import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskCreateSchema } from "@/lib/zod";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await db.task.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: "desc" } } },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = taskCreateSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await db.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      activities: { create: [{ message: "Task updated" }] },
    },
  });

  await db.activity.create({ data: { entity: "task", entityId: id, message: `Updated task: ${updated.title}` } });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await db.task.findUnique({ where: { id } });
  await db.task.delete({ where: { id } });
  await db.activity.create({ data: { entity: "task", entityId: id, message: `Deleted task: ${task?.title ?? id}` } });
  return NextResponse.json({ ok: true });
}
