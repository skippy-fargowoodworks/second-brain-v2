import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recurring = await db.recurringTask.findUnique({ where: { id } });
  if (!recurring) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recurring);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title, description, priority, schedule, dayOfWeek, dayOfMonth, active } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (priority !== undefined) updateData.priority = priority;
  if (schedule !== undefined) updateData.schedule = schedule;
  if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
  if (dayOfMonth !== undefined) updateData.dayOfMonth = dayOfMonth;
  if (active !== undefined) updateData.active = active;

  const recurring = await db.recurringTask.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(recurring);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.recurringTask.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
