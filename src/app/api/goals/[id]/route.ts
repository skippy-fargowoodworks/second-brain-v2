import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const goal = await db.goal.findUnique({
    where: { id },
    include: { keyResults: true },
  });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(goal);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title, description, targetDate, status, progress, category, keyResults } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
  if (status !== undefined) updateData.status = status;
  if (progress !== undefined) updateData.progress = Math.min(100, Math.max(0, progress));
  if (category !== undefined) updateData.category = category;

  const goal = await db.goal.update({
    where: { id },
    data: updateData,
    include: { keyResults: true },
  });

  // Update key results if provided
  if (keyResults && Array.isArray(keyResults)) {
    for (const kr of keyResults) {
      if (kr.id) {
        await db.keyResult.update({
          where: { id: kr.id },
          data: { current: kr.current, title: kr.title, target: kr.target, unit: kr.unit },
        });
      } else {
        await db.keyResult.create({
          data: { goalId: id, title: kr.title, target: kr.target, current: kr.current || 0, unit: kr.unit || "" },
        });
      }
    }
  }

  // Auto-calculate progress from key results
  const updatedKRs = await db.keyResult.findMany({ where: { goalId: id } });
  if (updatedKRs.length > 0) {
    const avgProgress = updatedKRs.reduce((sum, kr) => sum + (kr.current / kr.target) * 100, 0) / updatedKRs.length;
    await db.goal.update({ where: { id }, data: { progress: Math.round(avgProgress) } });
  }

  return NextResponse.json(await db.goal.findUnique({ where: { id }, include: { keyResults: true } }));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
