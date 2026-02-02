import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { credentialCreateSchema } from "@/lib/zod";

export async function GET() {
  const entries = await prisma.credential.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = credentialCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const entry = await prisma.credential.create({
    data: {
      service: parsed.data.service,
      username: parsed.data.username,
      password: parsed.data.password,
      url: parsed.data.url,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
