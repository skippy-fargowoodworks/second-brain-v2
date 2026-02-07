import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const days = parseInt(url.searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const where: Record<string, unknown> = {
    date: { gte: since },
  };
  if (category) {
    where.category = category;
  }

  const wins = await db.win.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(wins);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { content, category, date } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const win = await db.win.create({
    data: {
      content,
      category: category || "personal",
      date: date ? new Date(date) : new Date(),
    },
  });

  await db.activity.create({
    data: { entity: "win", entityId: win.id, message: `Logged win: ${content.slice(0, 50)}` },
  });

  return NextResponse.json(win, { status: 201 });
}
