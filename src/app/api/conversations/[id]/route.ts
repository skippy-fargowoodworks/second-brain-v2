import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversationCreateSchema } from "@/lib/zod";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await db.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(conversation);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = conversationCreateSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await db.conversation.update({
    where: { id },
    data: {
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      participants: parsed.data.participants,
      summary: parsed.data.summary,
      keyPoints: parsed.data.keyPoints,
    },
  });

  await db.activity.create({ data: { entity: "conversation", entityId: id, message: "Updated conversation" } });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.conversation.delete({ where: { id } });
  await db.activity.create({ data: { entity: "conversation", entityId: id, message: "Deleted conversation" } });
  return NextResponse.json({ ok: true });
}
