import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ q, results: { tasks: [], notes: [], conversations: [] } });

  const [tasks, notes, conversations] = await Promise.all([
    db.task.findMany({
      where: {
        OR: [{ title: { contains: q } }, { description: { contains: q } }, { tags: { contains: q } }],
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    db.note.findMany({
      where: {
        OR: [{ title: { contains: q } }, { content: { contains: q } }, { category: { contains: q } }],
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    db.conversation.findMany({
      where: {
        OR: [{ participants: { contains: q } }, { summary: { contains: q } }, { keyPoints: { contains: q } }],
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ q, results: { tasks, notes, conversations } });
}
