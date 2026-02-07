import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskCreateSchema, subtaskCreateSchema } from "@/lib/zod";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await db.task.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      subtasks: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = taskCreateSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Proof enforcement: if marking as done, all 4 proof fields must be filled
  if (parsed.data.status === "done") {
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const mergedProof = {
      proofWhatChanged: parsed.data.proofWhatChanged ?? existing.proofWhatChanged,
      proofWhatItDoes: parsed.data.proofWhatItDoes ?? existing.proofWhatItDoes,
      proofHowToUse: parsed.data.proofHowToUse ?? existing.proofHowToUse,
      proofTests: parsed.data.proofTests ?? existing.proofTests,
    };

    const missing: string[] = [];
    if (!mergedProof.proofWhatChanged) missing.push("proofWhatChanged");
    if (!mergedProof.proofWhatItDoes) missing.push("proofWhatItDoes");
    if (!mergedProof.proofHowToUse) missing.push("proofHowToUse");
    if (!mergedProof.proofTests) missing.push("proofTests");

    if (missing.length > 0) {
      return NextResponse.json(
        { error: "Cannot mark task done without proof", missing },
        { status: 400 }
      );
    }
  }

  const updated = await db.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      projectId: parsed.data.projectId,
      proofWhatChanged: parsed.data.proofWhatChanged,
      proofWhatItDoes: parsed.data.proofWhatItDoes,
      proofHowToUse: parsed.data.proofHowToUse,
      proofTests: parsed.data.proofTests,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      activities: { create: [{ message: "Task updated" }] },
    },
    include: { subtasks: { orderBy: { sortOrder: "asc" } } },
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
