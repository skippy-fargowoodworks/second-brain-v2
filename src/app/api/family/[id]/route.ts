import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.familyEvent.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { name, person, type, date, recurring, notes } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (person !== undefined) updateData.person = person;
  if (type !== undefined) updateData.type = type;
  if (recurring !== undefined) updateData.recurring = recurring;
  if (notes !== undefined) updateData.notes = notes;
  if (date !== undefined) {
    const eventDate = new Date(date);
    updateData.date = eventDate;
    updateData.month = eventDate.getMonth() + 1;
    updateData.day = eventDate.getDate();
  }

  const event = await db.familyEvent.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(event);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.familyEvent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
