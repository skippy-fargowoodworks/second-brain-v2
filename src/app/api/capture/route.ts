import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { type, content, priority, category } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  let result;
  const captureType = type || "note";

  switch (captureType) {
    case "task":
      result = await db.task.create({
        data: {
          title: content.slice(0, 100),
          description: content.length > 100 ? content : undefined,
          priority: priority || "medium",
        },
      });
      await db.activity.create({
        data: { entity: "task", entityId: result.id, message: `Quick captured task: ${result.title}` },
      });
      break;

    case "note":
      result = await db.note.create({
        data: {
          title: content.slice(0, 50),
          content: content,
          category: category || "Quick Capture",
        },
      });
      await db.activity.create({
        data: { entity: "note", entityId: result.id, message: `Quick captured note: ${result.title}` },
      });
      break;

    case "win":
      result = await db.win.create({
        data: {
          content: content,
          category: category || "personal",
        },
      });
      await db.activity.create({
        data: { entity: "win", entityId: result.id, message: `Quick captured win` },
      });
      break;

    case "decision":
      result = await db.decision.create({
        data: {
          title: content.slice(0, 100),
          description: content.length > 100 ? content : undefined,
          priority: priority || "medium",
        },
      });
      await db.activity.create({
        data: { entity: "decision", entityId: result.id, message: `Quick captured decision: ${result.title}` },
      });
      break;

    default:
      return NextResponse.json({ error: "Invalid type. Use: task, note, win, or decision" }, { status: 400 });
  }

  return NextResponse.json({ type: captureType, ...result }, { status: 201 });
}
