import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskCreateSchema, subtaskCreateSchema } from "@/lib/zod";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await db.task.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      subtasks: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = taskCreateSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Proof enforcement: if marking as done, ALL 5 proof fields must meet quality standards AND all subtasks must be complete
  if (parsed.data.status === "done") {
    const existing = await db.task.findUnique({ where: { id }, include: { subtasks: true } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Subtask completion check
    const subtasks = existing.subtasks ?? [];
    if (subtasks.length > 0) {
      const incomplete = subtasks.filter(s => !s.done);
      if (incomplete.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot mark task done — ${incomplete.length} of ${subtasks.length} subtasks are incomplete`,
            incompleteSubtasks: incomplete.map(s => s.title),
          },
          { status: 400 }
        );
      }
    }

    const merged = {
      proofWhatChanged: (parsed.data.proofWhatChanged ?? existing.proofWhatChanged ?? "").trim(),
      proofWhatItDoes: (parsed.data.proofWhatItDoes ?? existing.proofWhatItDoes ?? "").trim(),
      proofHowToUse: (parsed.data.proofHowToUse ?? existing.proofHowToUse ?? "").trim(),
      proofTests: (parsed.data.proofTests ?? existing.proofTests ?? "").trim(),
      proofScreenshot: (parsed.data.proofScreenshot ?? existing.proofScreenshot ?? "").trim(),
    };

    // Quality requirements per field — STRICT ENFORCEMENT (Jake directive Feb 7 2026)
    // "Replit Agent said it works" is NOT proof. Must have independent production verification.
    const requirements: { field: string; label: string; minLength: number; mustContain?: string[]; mustContainAll?: string[]; hint: string }[] = [
      {
        field: "proofWhatChanged",
        label: "What Changed",
        minLength: 50,
        hint: "List specific files modified, endpoints created, or configs changed. Example: 'server/routes.ts — Added /api/tax/estimate endpoint'"
      },
      {
        field: "proofWhatItDoes",
        label: "What It Does",
        minLength: 100,
        hint: "Explain the feature in plain English. Describe the full flow: what the customer sees, what happens behind the scenes, step by step."
      },
      {
        field: "proofHowToUse",
        label: "How to Use It",
        minLength: 100,
        mustContain: ["/", "http", "step", "click", "go to", "navigate", "visit", "open", "1.", "1)"],
        hint: "Provide step-by-step instructions with exact URLs, menu paths, and button names. A human must be able to follow these and use the feature."
      },
      {
        field: "proofTests",
        label: "Tests & Proof",
        minLength: 200,
        // Must contain ALL of these — proves real production testing, not agent self-reports
        mustContainAll: ["fargowoodworks1.com", "PASS"],
        mustContain: ["curl", "HTTP", "200", "actual", "expected"],
        hint: "Must include real production tests against fargowoodworks1.com with actual curl output, HTTP status codes, and PASS/FAIL. 'Replit Agent said it works' is NOT proof."
      },
      {
        field: "proofScreenshot",
        label: "Screenshot / Evidence URL",
        minLength: 10,
        mustContain: ["http", "/Users/", "screenshot", "png", "jpg", "drive.google", "imgur"],
        hint: "Provide an actual URL or file path to a screenshot. Not a description — an actual link to visual evidence."
      },
    ];

    const failures: { field: string; label: string; reason: string; hint: string }[] = [];

    for (const req of requirements) {
      const value = merged[req.field as keyof typeof merged];

      if (!value || value.length === 0) {
        failures.push({ field: req.field, label: req.label, reason: "Missing — field is empty", hint: req.hint });
        continue;
      }

      if (value.length < req.minLength) {
        failures.push({
          field: req.field,
          label: req.label,
          reason: `Too short (${value.length} chars, minimum ${req.minLength}). This looks like a low-effort placeholder, not real documentation.`,
          hint: req.hint
        });
        continue;
      }

      if (req.mustContain) {
        const lower = value.toLowerCase();
        const hasAny = req.mustContain.some(kw => lower.includes(kw.toLowerCase()));
        if (!hasAny) {
          failures.push({
            field: req.field,
            label: req.label,
            reason: `Content doesn't look like real ${req.label.toLowerCase()}. Expected keywords like: ${req.mustContain.slice(0, 5).join(", ")}`,
            hint: req.hint
          });
        }
      }

      // STRICT: mustContainAll — ALL keywords must be present (proves real production testing)
      if (req.mustContainAll) {
        const lower = value.toLowerCase();
        const missing = req.mustContainAll.filter(kw => !lower.includes(kw.toLowerCase()));
        if (missing.length > 0) {
          failures.push({
            field: req.field,
            label: req.label,
            reason: `Missing required evidence: ${missing.join(", ")}. Proof must include real production test results from fargowoodworks1.com with PASS/FAIL verdicts — not Replit Agent self-reports.`,
            hint: req.hint
          });
        }
      }
    }

    if (failures.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot mark task done — proof documentation is incomplete or low quality",
          failures: failures.map(f => ({
            field: f.field,
            label: f.label,
            reason: f.reason,
            hint: f.hint,
          })),
        },
        { status: 400 }
      );
    }
  }

  const updated = await db.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      tags: parsed.data.tags,
      projectId: parsed.data.projectId,
      proofWhatChanged: parsed.data.proofWhatChanged,
      proofWhatItDoes: parsed.data.proofWhatItDoes,
      proofHowToUse: parsed.data.proofHowToUse,
      proofTests: parsed.data.proofTests,
      proofScreenshot: parsed.data.proofScreenshot,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      activities: { create: [{ message: "Task updated" }] },
    },
    include: { subtasks: { orderBy: { sortOrder: "asc" } } },
  });

  await db.activity.create({ data: { entity: "task", entityId: id, message: `Updated task: ${updated.title}` } });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await db.task.findUnique({ where: { id } });
  await db.task.delete({ where: { id } });
  await db.activity.create({ data: { entity: "task", entityId: id, message: `Deleted task: ${task?.title ?? id}` } });
  return NextResponse.json({ ok: true });
}
