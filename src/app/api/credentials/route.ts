import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { credentialCreateSchema } from "@/lib/zod";
import { encrypt, decrypt } from "@/lib/crypto";

export async function GET() {
  const entries = await prisma.credential.findMany({ orderBy: { updatedAt: "desc" } });
  
  // Decrypt passwords for display
  const decrypted = entries.map((entry) => ({
    ...entry,
    password: decrypt(entry.password),
  }));
  
  return NextResponse.json(decrypted);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = credentialCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Encrypt password before storing
  const entry = await prisma.credential.create({
    data: {
      service: parsed.data.service,
      username: parsed.data.username,
      password: encrypt(parsed.data.password),
      url: parsed.data.url,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ ...entry, password: "[encrypted]" }, { status: 201 });
}
