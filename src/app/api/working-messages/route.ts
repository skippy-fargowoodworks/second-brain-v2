import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workingMessageCreateSchema } from "@/lib/zod";

export async function GET() {
  const messages = await db.workingMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(messages.reverse());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = workingMessageCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const msg = await db.workingMessage.create({ data: parsed.data });
  await db.activity.create({ data: { entity: "working", entityId: msg.id, message: `${msg.author}: ${msg.message.slice(0, 80)}` } });
  return NextResponse.json(msg);
}
