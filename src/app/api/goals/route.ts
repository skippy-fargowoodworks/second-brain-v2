import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const goals = await db.goal.findMany({
    include: { keyResults: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title, description, targetDate, category, keyResults } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const goal = await db.goal.create({
    data: {
      title,
      description,
      targetDate: targetDate ? new Date(targetDate) : null,
      category: category || "Business",
      keyResults: keyResults ? {
        create: keyResults.map((kr: { title: string; target: number; unit?: string }) => ({
          title: kr.title,
          target: kr.target,
          unit: kr.unit || "",
        })),
      } : undefined,
    },
    include: { keyResults: true },
  });

  await db.activity.create({
    data: { entity: "goal", entityId: goal.id, message: `Created goal: ${title}` },
  });

  return NextResponse.json(goal, { status: 201 });
}
