import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const upcoming = url.searchParams.get("upcoming") === "true";

  if (upcoming) {
    // Get events in the next 30 days
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

    const events = await db.familyEvent.findMany({
      where: {
        OR: [
          { month: currentMonth, day: { gte: currentDay } },
          { month: nextMonth },
        ],
      },
      orderBy: [{ month: "asc" }, { day: "asc" }],
    });
    return NextResponse.json(events);
  }

  const events = await db.familyEvent.findMany({
    orderBy: [{ month: "asc" }, { day: "asc" }],
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, person, type, date, recurring, notes } = body;

  if (!name || !date) {
    return NextResponse.json({ error: "Name and date are required" }, { status: 400 });
  }

  const eventDate = new Date(date);
  const event = await db.familyEvent.create({
    data: {
      name,
      person,
      type: type || "event",
      date: eventDate,
      month: eventDate.getMonth() + 1,
      day: eventDate.getDate(),
      recurring: recurring !== false,
      notes,
    },
  });

  await db.activity.create({
    data: { entity: "family", entityId: event.id, message: `Added family event: ${name}` },
  });

  return NextResponse.json(event, { status: 201 });
}
