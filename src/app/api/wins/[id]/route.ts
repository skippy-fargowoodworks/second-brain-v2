import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const win = await db.win.findUnique({ where: { id } });
  if (!win) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(win);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { content, category, date } = body;

  const updateData: Record<string, unknown> = {};
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (date !== undefined) updateData.date = new Date(date);

  const win = await db.win.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(win);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.win.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
