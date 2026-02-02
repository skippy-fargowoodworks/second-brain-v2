import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { noteCreateSchema } from "@/lib/zod";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await db.note.findUnique({ where: { id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = noteCreateSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await db.note.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
    },
  });

  await db.activity.create({ data: { entity: "note", entityId: id, message: `Updated note: ${updated.title}` } });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await db.note.findUnique({ where: { id } });
  await db.note.delete({ where: { id } });
  await db.activity.create({ data: { entity: "note", entityId: id, message: `Deleted note: ${note?.title ?? id}` } });
  return NextResponse.json({ ok: true });
}
