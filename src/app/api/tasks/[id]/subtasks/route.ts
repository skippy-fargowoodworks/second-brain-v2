import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subtaskCreateSchema } from "@/lib/zod";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subtasks = await db.subtask.findMany({
    where: { taskId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(subtasks);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = subtaskCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const count = await db.subtask.count({ where: { taskId: id } });

  const subtask = await db.subtask.create({
    data: {
      taskId: id,
      title: parsed.data.title,
      done: parsed.data.done ?? false,
      sortOrder: parsed.data.sortOrder ?? count,
    },
  });

  return NextResponse.json(subtask, { status: 201 });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Bulk update subtasks (toggle done, reorder)
  const body = await req.json().catch(() => ({}));
  const { subtaskId, done, title } = body as { subtaskId?: string; done?: boolean; title?: string };

  if (!subtaskId) return NextResponse.json({ error: "subtaskId required" }, { status: 400 });

  const { notes } = body as { subtaskId?: string; done?: boolean; title?: string; notes?: string };

  const updated = await db.subtask.update({
    where: { id: subtaskId },
    data: {
      ...(done !== undefined ? { done } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const subtaskId = searchParams.get("subtaskId");
  if (!subtaskId) return NextResponse.json({ error: "subtaskId required" }, { status: 400 });

  await db.subtask.delete({ where: { id: subtaskId } });
  return NextResponse.json({ ok: true });
}
