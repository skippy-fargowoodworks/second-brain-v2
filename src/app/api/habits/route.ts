import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const habits = await db.habit.findMany({
    orderBy: [{ active: "desc" }, { streak: "desc" }],
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 7,
      },
    },
  });
  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, description, frequency } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const habit = await db.habit.create({
    data: {
      name,
      description,
      frequency: frequency || "daily",
    },
  });

  await db.activity.create({
    data: { entity: "habit", entityId: habit.id, message: `Created habit: ${name}` },
  });

  return NextResponse.json(habit, { status: 201 });
}
