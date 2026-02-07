import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  snippet: string;
  createdAt: Date;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.toLowerCase();
  
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  const results: SearchResult[] = [];

  // Search tasks
  const tasks = await db.task.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    },
    take: 10,
  });
  tasks.forEach(t => results.push({
    type: "task",
    id: t.id,
    title: t.title,
    snippet: t.description?.slice(0, 100) || "",
    createdAt: t.createdAt,
  }));

  // Search notes
  const notes = await db.note.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
      ],
    },
    take: 10,
  });
  notes.forEach(n => results.push({
    type: "note",
    id: n.id,
    title: n.title,
    snippet: n.content.slice(0, 100),
    createdAt: n.createdAt,
  }));

  // Search conversations
  const conversations = await db.conversation.findMany({
    where: { summary: { contains: q } },
    take: 10,
  });
  conversations.forEach(c => results.push({
    type: "conversation",
    id: c.id,
    title: c.summary.slice(0, 50),
    snippet: c.summary.slice(0, 100),
    createdAt: c.createdAt,
  }));

  // Search decisions
  const decisions = await db.decision.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    },
    take: 10,
  });
  decisions.forEach(d => results.push({
    type: "decision",
    id: d.id,
    title: d.title,
    snippet: d.description?.slice(0, 100) || "",
    createdAt: d.createdAt,
  }));

  // Search working messages
  const messages = await db.workingMessage.findMany({
    where: { message: { contains: q } },
    take: 10,
  });
  messages.forEach(m => results.push({
    type: "working_message",
    id: m.id,
    title: `${m.author}: ${m.message.slice(0, 30)}`,
    snippet: m.message.slice(0, 100),
    createdAt: m.createdAt,
  }));

  // Sort by relevance (title match first) then date
  results.sort((a, b) => {
    const aTitle = a.title.toLowerCase().includes(q) ? 1 : 0;
    const bTitle = b.title.toLowerCase().includes(q) ? 1 : 0;
    if (aTitle !== bTitle) return bTitle - aTitle;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return NextResponse.json({ query: q, count: results.length, results: results.slice(0, 20) });
}
