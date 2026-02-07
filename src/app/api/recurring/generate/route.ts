import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();

  // Find all active recurring tasks that should generate today
  const tasks = await db.recurringTask.findMany({
    where: {
      active: true,
      OR: [
        { schedule: "daily" },
        { schedule: "weekly", dayOfWeek },
        { schedule: "monthly", dayOfMonth },
      ],
    },
  });

  const generated = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const recurring of tasks) {
    // Skip if already generated today
    if (recurring.lastGenerated && recurring.lastGenerated >= today) {
      continue;
    }

    // Create the task
    const task = await db.task.create({
      data: {
        title: recurring.title,
        description: recurring.description,
        priority: recurring.priority,
      },
    });

    // Update lastGenerated
    await db.recurringTask.update({
      where: { id: recurring.id },
      data: { lastGenerated: now },
    });

    generated.push({ recurringId: recurring.id, taskId: task.id, title: task.title });
  }

  return NextResponse.json({ generated, count: generated.length });
}
