import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await db.decision.findUnique({ where: { id } });
  if (!decision) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(decision);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title, description, context, options, priority, status, dueDate, resolution } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (context !== undefined) updateData.context = context;
  if (options !== undefined) updateData.options = JSON.stringify(options);
  if (priority !== undefined) updateData.priority = priority;
  if (status !== undefined) updateData.status = status;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (resolution !== undefined) {
    updateData.resolution = resolution;
    updateData.status = "resolved";
    updateData.resolvedAt = new Date();
  }

  const decision = await db.decision.update({
    where: { id },
    data: updateData,
  });

  await db.activity.create({
    data: { entity: "decision", entityId: id, message: resolution ? `Resolved decision: ${decision.title}` : `Updated decision: ${decision.title}` },
  });

  return NextResponse.json(decision);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await db.decision.findUnique({ where: { id } });
  if (!decision) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  await db.decision.delete({ where: { id } });
  await db.activity.create({
    data: { entity: "decision", entityId: id, message: `Deleted decision: ${decision.title}` },
  });

  return NextResponse.json({ success: true });
}
