import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noteCreateSchema } from "@/lib/zod";

export async function GET() {
  const notes = await db.note.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = noteCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const note = await db.note.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category ?? "General",
    },
  });

  await db.activity.create({ data: { entity: "note", entityId: note.id, message: `Created note: ${note.title}` } });

  return NextResponse.json(note);
}
