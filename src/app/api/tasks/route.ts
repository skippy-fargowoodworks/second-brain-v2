import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskCreateSchema } from "@/lib/zod";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  
  const where = projectId ? { projectId } : {};
  const limit = url.searchParams.get("limit");
  const tasks = await db.task.findMany({ 
    where,
    orderBy: [{ updatedAt: "desc" }],
    include: {
      project: { select: { id: true, name: true } },
      subtasks: { orderBy: { sortOrder: "asc" } },
    },
    ...(limit ? { take: parseInt(limit, 10) } : {}),
  });
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
      projectId: parsed.data.projectId,
      proofWhatChanged: parsed.data.proofWhatChanged,
      proofWhatItDoes: parsed.data.proofWhatItDoes,
      proofHowToUse: parsed.data.proofHowToUse,
      proofTests: parsed.data.proofTests,
      proofScreenshot: parsed.data.proofScreenshot,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      activities: { create: [{ message: "Task created" }] },
    },
  });

  await db.activity.create({ data: { entity: "task", entityId: task.id, message: `Created task: ${task.title}` } });

  return NextResponse.json(task);
}
