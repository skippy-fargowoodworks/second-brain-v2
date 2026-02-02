"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, ListTodo } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "backlog" | "in_progress" | "review" | "done";
  priority: "critical" | "high" | "medium" | "low";
  tags: string;
  updatedAt: string;
  createdAt: string;
};

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);

  async function refresh() {
    const res = await fetch("/api/tasks", { cache: "no-store" });
    const data = (await res.json()) as Task[];
    setTasks(data);
  }

  async function remove(id: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    toast("Deleted");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="kicker text-[11px] font-medium text-white/55">TASKS</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-2 text-sm text-white/55">Track execution, priority, and pipeline state.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl bg-blue-500/70 hover:bg-blue-500">
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-slate-950/80 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Task" : "New Task"}</DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editing}
              onDone={async () => {
                setOpen(false);
                setEditing(null);
                await refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <ListTodo className="h-4 w-4" /> {tasks.length} total
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/60">Title</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Priority</TableHead>
                <TableHead className="text-white/60">Tags</TableHead>
                <TableHead className="text-right text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((t) => (
                <TableRow key={t.id} className="border-white/10">
                  <TableCell className="font-medium text-white/90">{t.title}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell>{priorityBadge(t.priority)}</TableCell>
                  <TableCell className="text-white/60">{t.tags || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                        onClick={() => {
                          setEditing(t);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                        onClick={() => remove(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow className="border-white/10">
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-white/45">
                    No tasks yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function statusBadge(status: Task["status"]) {
  const map: Record<Task["status"], string> = {
    backlog: "bg-blue-500/10 text-blue-200 border-blue-500/20",
    in_progress: "bg-purple-500/10 text-purple-200 border-purple-500/20",
    review: "bg-sky-500/10 text-sky-200 border-sky-500/20",
    done: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
  };
  return <Badge className={`border ${map[status]}`}>{status.replace("_", " ").toUpperCase()}</Badge>;
}

function priorityBadge(priority: Task["priority"]) {
  const map: Record<Task["priority"], string> = {
    critical: "bg-amber-500/10 text-amber-200 border-amber-500/20",
    high: "bg-red-500/10 text-red-200 border-red-500/20",
    medium: "bg-white/5 text-white/70 border-white/10",
    low: "bg-white/5 text-white/60 border-white/10",
  };
  return <Badge className={`border ${map[priority]}`}>{priority.toUpperCase()}</Badge>;
}

function TaskForm({ task, onDone }: { task: Task | null; onDone: () => void }) {
  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(task?.description ?? "");
  const [status, setStatus] = React.useState<Task["status"]>(task?.status ?? "backlog");
  const [priority, setPriority] = React.useState<Task["priority"]>(task?.priority ?? "medium");
  const [tags, setTags] = React.useState(task?.tags ?? "");
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      const payload = { title, description, status, priority, tags };
      const res = await fetch(task ? `/api/tasks/${task.id}` : "/api/tasks", {
        method: task ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast(task ? "Task updated" : "Task created");
      onDone();
    } catch {
      toast.error("Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-xl border-white/10 bg-white/5" />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="min-h-[100px] rounded-xl border-white/10 bg-white/5" />

      <div className="grid grid-cols-2 gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value as Task["status"])} className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm">
          <option value="backlog">Backlog</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm">
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated)" className="rounded-xl border-white/10 bg-white/5" />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" className="rounded-xl bg-white/5 hover:bg-white/10" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={pending} className="rounded-xl bg-blue-500/70 hover:bg-blue-500" onClick={submit}>
          Save
        </Button>
      </div>
    </div>
  );
}
