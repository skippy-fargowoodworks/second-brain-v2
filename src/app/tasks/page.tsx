export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { TasksClient } from "@/components/tasks/tasks-client";

export default async function TasksPage() {
  const tasks = await db.task.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { subtasks: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <TasksClient
      initialTasks={tasks.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        dueDate: t.dueDate?.toISOString() ?? null,
      }))}
    />
  );
}
