import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskCreateSchema } from "@/lib/zod";

export async function GET() {
  const tasks = await db.task.findMany({ orderBy: [{ updatedAt: "desc" }] });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const task = await db.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status ?? "backlog",
      priority: parsed.data.priority ?? "medium",
      tags: parsed.data.tags ?? "",
      activities: { create: [{ message: "Task created" }] },
    },
  });

  await db.activity.create({ data: { entity: "task", entityId: task.id, message: `Created task: ${task.title}` } });

  return NextResponse.json(task);
}
