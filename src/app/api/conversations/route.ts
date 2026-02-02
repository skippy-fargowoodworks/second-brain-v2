import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversationCreateSchema } from "@/lib/zod";

export async function GET() {
  const conversations = await db.conversation.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = conversationCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const conversation = await db.conversation.create({
    data: {
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      participants: parsed.data.participants ?? "",
      summary: parsed.data.summary,
      keyPoints: parsed.data.keyPoints ?? "",
    },
  });

  await db.activity.create({
    data: { entity: "conversation", entityId: conversation.id, message: `Logged conversation (${conversation.participants || ""})` },
  });

  return NextResponse.json(conversation);
}
