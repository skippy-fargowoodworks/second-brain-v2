import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const decisions = await db.decision.findMany({
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(decisions);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title, description, context, options, priority, dueDate } = body;
  
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const decision = await db.decision.create({
    data: {
      title,
      description,
      context,
      options: options ? JSON.stringify(options) : null,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  await db.activity.create({
    data: { entity: "decision", entityId: decision.id, message: `Created decision: ${title}` },
  });

  return NextResponse.json(decision, { status: 201 });
}
