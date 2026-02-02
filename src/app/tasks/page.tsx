import { db } from "@/lib/db";
import { TasksClient } from "@/components/tasks/tasks-client";

export default async function TasksPage() {
  const tasks = await db.task.findMany({ orderBy: [{ updatedAt: "desc" }] });

  return (
    <TasksClient
      initialTasks={tasks.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))}
    />
  );
}
