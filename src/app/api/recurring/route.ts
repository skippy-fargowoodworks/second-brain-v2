import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const recurring = await db.recurringTask.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(recurring);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title, description, priority, schedule, dayOfWeek, dayOfMonth, generate } = body;

  if (!title || !schedule) {
    return NextResponse.json({ error: "Title and schedule are required" }, { status: 400 });
  }

  // Validate schedule-specific fields
  if (schedule === "weekly" && (dayOfWeek === undefined || dayOfWeek < 0 || dayOfWeek > 6)) {
    return NextResponse.json({ error: "Weekly tasks require dayOfWeek (0-6)" }, { status: 400 });
  }
  if (schedule === "monthly" && (dayOfMonth === undefined || dayOfMonth < 1 || dayOfMonth > 31)) {
    return NextResponse.json({ error: "Monthly tasks require dayOfMonth (1-31)" }, { status: 400 });
  }

  const recurring = await db.recurringTask.create({
    data: {
      title,
      description,
      priority: priority || "medium",
      schedule,
      dayOfWeek: schedule === "weekly" ? dayOfWeek : null,
      dayOfMonth: schedule === "monthly" ? dayOfMonth : null,
    },
  });

  await db.activity.create({
    data: { entity: "recurring", entityId: recurring.id, message: `Created recurring task: ${title} (${schedule})` },
  });

  // Optionally generate the first task immediately
  if (generate) {
    await db.task.create({
      data: {
        title: recurring.title,
        description: recurring.description,
        priority: recurring.priority,
      },
    });
    await db.recurringTask.update({
      where: { id: recurring.id },
      data: { lastGenerated: new Date() },
    });
  }

  return NextResponse.json(recurring, { status: 201 });
}
