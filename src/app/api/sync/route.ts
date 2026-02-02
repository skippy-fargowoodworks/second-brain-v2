import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bulk sync endpoint for Skippy
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  
  const results: Record<string, unknown> = {};
  
  // Sync tasks
  if (body.tasks && Array.isArray(body.tasks)) {
    for (const task of body.tasks) {
      const created = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description || "",
          status: task.status || "backlog",
          priority: task.priority || "medium",
          tags: task.tags || "",
        },
      });
      results[`task_${created.id}`] = created;
    }
  }
  
  // Sync notes
  if (body.notes && Array.isArray(body.notes)) {
    for (const note of body.notes) {
      const created = await prisma.note.create({
        data: {
          title: note.title,
          content: note.content,
          category: note.category || "General",
        },
      });
      results[`note_${created.id}`] = created;
    }
  }
  
  // Sync conversations
  if (body.conversations && Array.isArray(body.conversations)) {
    for (const conv of body.conversations) {
      const created = await prisma.conversation.create({
        data: {
          summary: conv.summary,
          participants: conv.participants || "",
          keyPoints: conv.keyPoints || "",
        },
      });
      results[`conversation_${created.id}`] = created;
    }
  }
  
  // Sync working messages
  if (body.workingMessages && Array.isArray(body.workingMessages)) {
    for (const msg of body.workingMessages) {
      const created = await prisma.workingMessage.create({
        data: {
          author: msg.author,
          message: msg.message,
        },
      });
      results[`working_${created.id}`] = created;
    }
  }
  
  // Update status
  if (body.status) {
    const existing = await prisma.status.findFirst();
    if (existing) {
      await prisma.status.update({
        where: { id: existing.id },
        data: { status: body.status },
      });
    } else {
      await prisma.status.create({
        data: { status: body.status },
      });
    }
    results.status = body.status;
  }
  
  return NextResponse.json({ ok: true, synced: results });
}

// Get current state
export async function GET() {
  const [tasks, notes, conversations, status] = await Promise.all([
    prisma.task.findMany({ orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.note.findMany({ orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.conversation.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.status.findFirst(),
  ]);
  
  return NextResponse.json({
    tasks,
    notes,
    conversations,
    status: status?.status || "idle",
  });
}
