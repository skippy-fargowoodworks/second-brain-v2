import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - fetch usage stats
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.SKIPPY_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all usage records
  const records = await db.usage.findMany({
    where: { date: { gte: startDate } },
    orderBy: { date: "desc" },
  });

  // Calculate totals
  const totals = records.reduce(
    (acc, r) => ({
      tokensIn: acc.tokensIn + r.tokensIn,
      tokensOut: acc.tokensOut + r.tokensOut,
      cost: acc.cost + r.cost,
    }),
    { tokensIn: 0, tokensOut: 0, cost: 0 }
  );

  // Group by model
  const byModel = records.reduce((acc, r) => {
    if (!acc[r.model]) {
      acc[r.model] = { tokensIn: 0, tokensOut: 0, cost: 0, count: 0 };
    }
    acc[r.model].tokensIn += r.tokensIn;
    acc[r.model].tokensOut += r.tokensOut;
    acc[r.model].cost += r.cost;
    acc[r.model].count += 1;
    return acc;
  }, {} as Record<string, { tokensIn: number; tokensOut: number; cost: number; count: number }>);

  // Group by day
  const byDay = records.reduce((acc, r) => {
    const day = r.date.toISOString().split("T")[0];
    if (!acc[day]) {
      acc[day] = { tokensIn: 0, tokensOut: 0, cost: 0 };
    }
    acc[day].tokensIn += r.tokensIn;
    acc[day].tokensOut += r.tokensOut;
    acc[day].cost += r.cost;
    return acc;
  }, {} as Record<string, { tokensIn: number; tokensOut: number; cost: number }>);

  return NextResponse.json({
    days,
    totals,
    byModel,
    byDay,
    recordCount: records.length,
  });
}

// POST - log usage
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.SKIPPY_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { model, provider, tokensIn, tokensOut, cost, sessionKey } = body;

  if (!model || !provider) {
    return NextResponse.json({ error: "model and provider required" }, { status: 400 });
  }

  const usage = await db.usage.create({
    data: {
      model,
      provider,
      tokensIn: tokensIn || 0,
      tokensOut: tokensOut || 0,
      cost: cost || 0,
      sessionKey,
    },
  });

  return NextResponse.json({ ok: true, usage });
}
