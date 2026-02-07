import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const habit = await db.habit.findUnique({
    where: { id },
    include: { logs: { orderBy: { date: "desc" }, take: 30 } },
  });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(habit);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, description, frequency, active } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (frequency !== undefined) updateData.frequency = frequency;
  if (active !== undefined) updateData.active = active;

  const habit = await db.habit.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(habit);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.habit.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// POST to log completion
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { completed, notes, date } = body;

  const habit = await db.habit.findUnique({ where: { id } });
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logDate = date ? new Date(date) : new Date();
  const dateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());

  // Check if already logged for this date
  const existing = await db.habitLog.findFirst({
    where: {
      habitId: id,
      date: dateOnly,
    },
  });

  let log;
  if (existing) {
    log = await db.habitLog.update({
      where: { id: existing.id },
      data: { completed: completed !== false, notes },
    });
  } else {
    log = await db.habitLog.create({
      data: {
        habitId: id,
        date: dateOnly,
        completed: completed !== false,
        notes,
      },
    });
  }

  // Update streak
  const logs = await db.habitLog.findMany({
    where: { habitId: id, completed: true },
    orderBy: { date: "desc" },
  });

  let streak = 0;
  let lastDate: Date | null = null;
  for (const l of logs) {
    if (!lastDate) {
      // Check if this is today or yesterday
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - l.date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak = 1;
        lastDate = l.date;
      } else {
        break;
      }
    } else {
      const diffDays = Math.floor((lastDate.getTime() - l.date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
        lastDate = l.date;
      } else {
        break;
      }
    }
  }

  await db.habit.update({
    where: { id },
    data: {
      streak,
      longestStreak: Math.max(habit.longestStreak, streak),
    },
  });

  return NextResponse.json({ log, streak });
}
