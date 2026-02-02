import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const status = await prisma.status.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    status ?? { id: "", status: "idle", updatedAt: new Date() }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const nextStatus = body?.status === "working" ? "working" : "idle";

  const existing = await prisma.status.findFirst();
  const updated = existing
    ? await prisma.status.update({
        where: { id: existing.id },
        data: { status: nextStatus },
      })
    : await prisma.status.create({
        data: { status: nextStatus },
      });

  return NextResponse.json(updated);
}
