import { z } from "zod";

export const statusSchema = z.object({ status: z.enum(["working", "idle"]) });

export const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["backlog", "in_progress", "review", "done"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  tags: z.string().optional(),
});

export const noteCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().optional(),
});

export const credentialCreateSchema = z.object({
  service: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  url: z.string().optional(),
  notes: z.string().optional(),
});

export const conversationCreateSchema = z.object({
  date: z.string().datetime().optional(),
  participants: z.string().optional(),
  summary: z.string().min(1),
  keyPoints: z.string().optional(),
});

export const workingMessageCreateSchema = z.object({
  author: z.string().min(1),
  message: z.string().min(1),
});
