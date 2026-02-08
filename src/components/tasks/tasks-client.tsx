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
import { Plus, Trash2, Pencil, ListTodo, Check, Square, CheckSquare, X, ChevronRight, ChevronDown, Upload, ZoomIn } from "lucide-react";

type Subtask = {
  id: string;
  title: string;
  done: boolean;
  notes: string | null;
  sortOrder: number;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "backlog" | "in_progress" | "review" | "done";
  priority: "critical" | "high" | "medium" | "low";
  tags: string;
  dueDate: string | null;
  proofWhatChanged: string | null;
  proofWhatItDoes: string | null;
  proofHowToUse: string | null;
  proofTests: string | null;
  proofScreenshot: string | null;
  subtasks?: Subtask[];
  updatedAt: string;
  createdAt: string;
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hours = Math.floor(diff / 3600000);
    if (hours === 0) {
      const mins = Math.floor(diff / 60000);
      return mins <= 1 ? "just now" : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDueDate(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - now.getTime()) / 86400000);
  const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (diff < 0) return label; // overdue
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return label;
}

function isDueOverdue(d: string | null): boolean {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
}

function isDueSoon(d: string | null): boolean {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  const diff = (date.getTime() - now.getTime()) / 86400000;
  return diff >= 0 && diff <= 2;
}

export function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);
  const [detailTask, setDetailTask] = React.useState<Task | null>(null);
  const [lightboxSrc, setLightboxSrc] = React.useState<string | null>(null);

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

  function proofCount(t: Task): number {
    return [t.proofWhatChanged, t.proofWhatItDoes, t.proofHowToUse, t.proofTests, t.proofScreenshot]
      .filter(v => v && v.trim() !== "").length;
  }

  const [expandedTasks, setExpandedTasks] = React.useState<Set<string>>(new Set());

  function toggleExpand(taskId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  function subtaskProgress(t: Task): { done: number; total: number } {
    const subs = t.subtasks ?? [];
    return { done: subs.filter(s => s.done).length, total: subs.length };
  }

  async function toggleSubtaskInline(taskId: string, sub: Subtask) {
    const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subtaskId: sub.id, done: !sub.done }),
    });
    if (res.ok) await refresh();
  }

  return (
    <>
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
                  <TableHead className="text-white/60 w-8"></TableHead>
                  <TableHead className="text-white/60">Title</TableHead>
                  <TableHead className="text-white/60">Status</TableHead>
                  <TableHead className="text-white/60">Priority</TableHead>
                  <TableHead className="text-white/60">Subtasks</TableHead>
                  <TableHead className="text-white/60">Proof</TableHead>
                  <TableHead className="text-white/60">Due</TableHead>
                  <TableHead className="text-white/60">Updated</TableHead>
                  <TableHead className="text-right text-white/60">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((t) => {
                  const { done: subDone, total: subTotal } = subtaskProgress(t);
                  const isExpanded = expandedTasks.has(t.id);
                  const hasSubtasks = subTotal > 0;
                  const subPercent = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

                  return (
                    <React.Fragment key={t.id}>
                      <TableRow className="border-white/10 cursor-pointer hover:bg-white/5" onClick={() => setDetailTask(t)}>
                        {/* Expand toggle */}
                        <TableCell className="w-8 px-2">
                          {hasSubtasks ? (
                            <button
                              onClick={(e) => toggleExpand(t.id, e)}
                              className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          ) : (
                            <span className="w-4 h-4 block" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-white/90 max-w-[300px] truncate">{t.title}</TableCell>
                        <TableCell>{statusBadge(t.status)}</TableCell>
                        <TableCell>{priorityBadge(t.priority)}</TableCell>
                        {/* Subtask progress */}
                        <TableCell>
                          {hasSubtasks ? (
                            <div className="flex items-center gap-2 min-w-[90px]">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[40px]">
                                <div
                                  className={`h-full rounded-full transition-all ${subPercent === 100 ? "bg-emerald-400" : subPercent > 50 ? "bg-blue-400" : subPercent > 0 ? "bg-amber-400" : "bg-white/20"}`}
                                  style={{ width: `${subPercent}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium whitespace-nowrap ${subPercent === 100 ? "text-emerald-400" : "text-white/50"}`}>
                                {subDone}/{subTotal}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-white/30">—</span>
                          )}
                        </TableCell>
                        <TableCell>{proofBadge(proofCount(t))}</TableCell>
                        <TableCell>
                          <span className={`text-sm ${isDueOverdue(t.dueDate) ? "text-red-400 font-medium" : isDueSoon(t.dueDate) ? "text-amber-400" : "text-white/50"}`}>
                            {formatDueDate(t.dueDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-white/50">{formatDate(t.updatedAt)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2" onClick={(e) => e.stopPropagation()}>
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

                      {/* Expanded subtask rows */}
                      {isExpanded && hasSubtasks && (t.subtasks ?? []).map((sub) => (
                        <TableRow key={sub.id} className="border-white/5 bg-white/[0.02]">
                          <TableCell className="w-8 px-2" />
                          <TableCell colSpan={7} className="py-1.5">
                            <div className="flex items-center gap-2 pl-4">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleSubtaskInline(t.id, sub); }}
                                className="shrink-0 text-white/70 hover:text-white"
                              >
                                {sub.done ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4" />}
                              </button>
                              <span className={`text-sm ${sub.done ? "line-through text-white/35" : "text-white/65"}`}>
                                {sub.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
                {tasks.length === 0 && (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-white/45">
                      No tasks yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {detailTask && (
        <Dialog open={!!detailTask} onOpenChange={(v) => !v && setDetailTask(null)}>
          <DialogContent className="border-white/10 bg-slate-950/80 text-white backdrop-blur-xl max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-xl pr-8">{detailTask.title}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2 -mr-2">
              <TaskDetailDialog
                task={detailTask}
                onSaved={async () => {
                  setDetailTask(null);
                  await refresh();
                }}
                onClose={() => setDetailTask(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lightbox for full-size screenshot viewing */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img src={lightboxSrc} alt="Screenshot full view" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" />
            <button
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
              onClick={() => setLightboxSrc(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
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

function proofBadge(count: number) {
  const color = count === 0
    ? "bg-red-500/10 text-red-200 border-red-500/20"
    : count === 5
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20"
      : "bg-amber-500/10 text-amber-200 border-amber-500/20";
  return <Badge className={`border ${color}`}>{count}/5</Badge>;
}

/* ──────────────── SUBTASKS SECTION ──────────────── */

function SubtasksSection({ taskId, initialSubtasks }: { taskId: string; initialSubtasks: Subtask[] }) {
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(initialSubtasks);
  const [newTitle, setNewTitle] = React.useState("");
  const [editingNotes, setEditingNotes] = React.useState<string | null>(null);
  const [notesValue, setNotesValue] = React.useState("");

  async function addSubtask() {
    if (!newTitle.trim()) return;
    const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (res.ok) {
      const sub = await res.json();
      setSubtasks([...subtasks, sub]);
      setNewTitle("");
    }
  }

  async function toggleSubtask(sub: Subtask) {
    const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subtaskId: sub.id, done: !sub.done }),
    });
    if (res.ok) {
      setSubtasks(subtasks.map(s => s.id === sub.id ? { ...s, done: !s.done } : s));
    }
  }

  async function saveNotes(subId: string) {
    const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subtaskId: subId, notes: notesValue }),
    });
    if (res.ok) {
      setSubtasks(subtasks.map(s => s.id === subId ? { ...s, notes: notesValue } : s));
      setEditingNotes(null);
      toast("Subtask notes saved");
    }
  }

  async function removeSubtask(subId: string) {
    const res = await fetch(`/api/tasks/${taskId}/subtasks?subtaskId=${subId}`, { method: "DELETE" });
    if (res.ok) {
      setSubtasks(subtasks.filter(s => s.id !== subId));
    }
  }

  const done = subtasks.filter(s => s.done).length;
  const allDone = subtasks.length > 0 && done === subtasks.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm font-medium text-white/80">Subtasks</label>
        {subtasks.length > 0 && (
          <Badge className={`border text-xs ${allDone ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20" : "bg-amber-500/10 text-amber-200 border-amber-500/20"}`}>
            {done}/{subtasks.length} complete
          </Badge>
        )}
      </div>
      {subtasks.length > 0 && !allDone && (
        <p className="text-xs text-amber-400/80 mb-2">All subtasks must be completed before this task can be marked done.</p>
      )}

      <div className="space-y-0.5">
        {subtasks.map((sub) => (
          <div key={sub.id} className="group rounded-lg px-2 py-1.5 hover:bg-white/5">
            <div className="flex items-center gap-2">
              <button onClick={() => toggleSubtask(sub)} className="shrink-0 text-white/70 hover:text-white">
                {sub.done ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4" />}
              </button>
              <span className={`flex-1 text-sm ${sub.done ? "line-through text-white/40" : "text-white/80"}`}>
                {sub.title}
              </span>
              <button
                onClick={() => {
                  if (editingNotes === sub.id) { setEditingNotes(null); }
                  else { setEditingNotes(sub.id); setNotesValue(sub.notes ?? ""); }
                }}
                className={`shrink-0 text-xs px-1.5 py-0.5 rounded transition-colors ${editingNotes === sub.id ? "bg-blue-500/20 text-blue-300" : "opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60"}`}
              >
                {sub.notes ? "notes" : "+ notes"}
              </button>
              <button
                onClick={() => removeSubtask(sub.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Show existing notes inline */}
            {sub.notes && editingNotes !== sub.id && (
              <div className="ml-6 mt-1 text-xs text-white/40 whitespace-pre-wrap border-l-2 border-white/10 pl-2">
                {sub.notes}
              </div>
            )}
            {/* Notes editor */}
            {editingNotes === sub.id && (
              <div className="ml-6 mt-2 space-y-1">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add proof/verification notes for this subtask..."
                  className="min-h-[60px] text-xs rounded-lg border-white/10 bg-white/5"
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-6 text-xs rounded-md bg-blue-500/50 hover:bg-blue-500" onClick={() => saveNotes(sub.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="secondary" className="h-6 text-xs rounded-md bg-white/5 hover:bg-white/10" onClick={() => setEditingNotes(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 h-8 text-sm rounded-lg border-white/10 bg-white/5"
          onKeyDown={(e) => e.key === "Enter" && addSubtask()}
        />
        <Button size="sm" className="h-8 rounded-lg bg-white/10 hover:bg-white/20 text-xs" onClick={addSubtask}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}

/* ──────────────── TASK DETAIL DIALOG ──────────────── */

function TaskDetailDialog({ task, onSaved, onClose }: { task: Task; onSaved: () => void; onClose: () => void }) {
  const [proofWhatChanged, setProofWhatChanged] = React.useState(task.proofWhatChanged ?? "");
  const [proofWhatItDoes, setProofWhatItDoes] = React.useState(task.proofWhatItDoes ?? "");
  const [proofHowToUse, setProofHowToUse] = React.useState(task.proofHowToUse ?? "");
  const [proofTests, setProofTests] = React.useState(task.proofTests ?? "");
  const [proofScreenshot, setProofScreenshot] = React.useState(task.proofScreenshot ?? "");
  const [pending, setPending] = React.useState(false);

  async function saveProof() {
    setPending(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proofWhatChanged, proofWhatItDoes, proofHowToUse, proofTests, proofScreenshot }),
      });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Failed to save proof");
        return;
      }
      toast("Proof saved");
      onSaved();
    } catch {
      toast.error("Failed to save proof");
    } finally {
      setPending(false);
    }
  }

  const proofCountValue = [proofWhatChanged, proofWhatItDoes, proofHowToUse, proofTests, proofScreenshot]
    .filter(v => v && v.trim() !== "").length;

  return (
    <div className="space-y-5 pb-4">
      {/* Header info */}
      <div className="flex flex-wrap gap-2 items-center">
        {statusBadge(task.status)}
        {priorityBadge(task.priority)}
        {proofBadge(proofCountValue)}
        {task.dueDate && (
          <span className={`text-xs px-2 py-0.5 rounded ${isDueOverdue(task.dueDate) ? "bg-red-500/20 text-red-300" : isDueSoon(task.dueDate) ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/60"}`}>
            Due: {formatDueDate(task.dueDate)}
          </span>
        )}
        <span className="text-xs text-white/40 ml-auto">Updated {formatDate(task.updatedAt)}</span>
      </div>

      {/* Description */}
      {task.description && (
        <div>
          <label className="text-sm font-medium text-white/80">Description</label>
          <div className="mt-1 text-sm text-white/60 whitespace-pre-wrap max-h-[200px] overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3">
            {task.description}
          </div>
        </div>
      )}

      {/* Subtasks */}
      <SubtasksSection taskId={task.id} initialSubtasks={task.subtasks ?? []} />

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Proof Section */}
      <div className="text-sm font-semibold text-white/90">Proof Documentation</div>

      <div>
        <label className="text-sm font-medium text-white/80">What Changed</label>
        <p className="text-xs text-white/40 mt-0.5 mb-1">Min 50 chars. List every file, endpoint, config, or schema change.</p>
        <Textarea
          value={proofWhatChanged}
          onChange={(e) => setProofWhatChanged(e.target.value)}
          placeholder={"Files modified:\n- server/routes.ts — Added /api/tax/estimate endpoint\n- client/src/pages/shop/ShopCheckout.tsx — Tax display component\n- modules/commerce/server/webhookHandler.ts — Persist tax from Stripe session\n\nNew endpoints:\n- GET /api/tax/estimate — Returns tax estimate for cart\n\nConfig changes:\n- Stripe automatic_tax enabled on checkout sessions"}
          className="mt-1 min-h-[100px] rounded-xl border-white/10 bg-white/5"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white/80">What It Does</label>
        <p className="text-xs text-white/40 mt-0.5 mb-1">Min 100 chars. Explain the full feature flow in plain English.</p>
        <Textarea
          value={proofWhatItDoes}
          onChange={(e) => setProofWhatItDoes(e.target.value)}
          placeholder={"When a customer adds items to their cart and proceeds to checkout, the system now automatically calculates sales tax based on the shipping address using Stripe Tax.\n\nFlow:\n1. Customer adds items to cart\n2. At checkout, enters shipping address\n3. System calls Stripe Tax API with address + line items\n4. Tax amount displays in the order summary\n5. On payment, webhook persists the tax amount to the order record\n\nAdmin sees: Tax amount on each order in the admin panel\nCustomer sees: Tax line item in checkout before payment"}
          className="mt-1 min-h-[100px] rounded-xl border-white/10 bg-white/5"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white/80">How to Use It</label>
        <p className="text-xs text-white/40 mt-0.5 mb-1">Min 100 chars. Must include URLs or step-by-step instructions a human can follow.</p>
        <Textarea
          value={proofHowToUse}
          onChange={(e) => setProofHowToUse(e.target.value)}
          placeholder={"Step 1: Go to https://fargowoodworks1.com/shop\nStep 2: Click on any product (e.g., Black Walnut Live Edge Bench)\nStep 3: Click 'Add to Cart'\nStep 4: Click 'Checkout' in the cart\nStep 5: Enter a shipping address (e.g., 123 Main St, Fargo ND 58102)\nStep 6: Tax line item appears in the order summary showing calculated tax\nStep 7: Complete payment — tax amount is saved to the order record\n\nAdmin verification:\nStep 1: Go to https://fargowoodworks1.com/admin/orders\nStep 2: Click on the test order\nStep 3: Verify tax amount is displayed in order details"}
          className="mt-1 min-h-[100px] rounded-xl border-white/10 bg-white/5"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white/80">Tests & Proof</label>
        <p className="text-xs text-white/40 mt-0.5 mb-1">Min 150 chars. Include at least 3 tests with: exact command/URL, expected result, actual result, PASS/FAIL. Show real output.</p>
        <Textarea
          value={proofTests}
          onChange={(e) => setProofTests(e.target.value)}
          placeholder={"Test 1: Endpoint exists\nCommand: curl -s https://...\nExpected: 200 OK with JSON\nActual: {\"status\":\"ok\"} — 200\nStatus: PASS\n\nTest 2: Error handling\nCommand: curl -s -X POST https://... -d '{}'\nExpected: 400 with validation error\nActual: {\"error\":\"missing fields\"} — 400\nStatus: PASS"}
          className="mt-1 min-h-[120px] rounded-xl border-white/10 bg-white/5"
        />
      </div>

      <ScreenshotUpload value={proofScreenshot} onChange={setProofScreenshot} />

      {task.status === "done" && proofCountValue < 5 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          This task is marked done but proof is incomplete ({proofCountValue}/5). All 5 proof fields must be filled with quality documentation.
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" className="rounded-xl bg-white/5 hover:bg-white/10" onClick={onClose}>
          Close
        </Button>
        <Button disabled={pending} className="rounded-xl bg-blue-500/70 hover:bg-blue-500" onClick={saveProof}>
          Save Proof
        </Button>
      </div>
    </div>
  );
}

/* ──────────────── SCREENSHOT UPLOAD ──────────────── */

function ScreenshotUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result); // base64 data URL
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) handleFile(file);
        e.preventDefault();
        return;
      }
    }
  }

  const hasImage = value && (value.startsWith("data:image/") || value.startsWith("http"));

  return (
    <div>
      <label className="text-sm font-medium text-white/80">Screenshot</label>
      <p className="text-xs text-white/40 mt-0.5 mb-2">Required. Upload, paste, or drag an image proving the feature works.</p>

      {hasImage ? (
        <div className="space-y-2">
          {/* Thumbnail */}
          <div className="relative group inline-block">
            <img
              src={value}
              alt="Proof screenshot"
              className="h-32 w-auto rounded-xl border border-white/10 object-cover cursor-pointer hover:border-white/30 transition-colors"
              onClick={() => setLightbox(true)}
              onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
            />
            <div
              className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => setLightbox(true)}
            >
              <ZoomIn className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs rounded-lg bg-white/10 hover:bg-white/20"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-1" /> Replace
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300"
              onClick={() => onChange("")}
            >
              <X className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>

          {/* Lightbox */}
          {lightbox && (
            <div
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 cursor-pointer"
              onClick={() => setLightbox(false)}
            >
              <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                <img src={value} alt="Screenshot full view" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" />
                <button
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
                  onClick={() => setLightbox(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-blue-400 bg-blue-500/10" : "border-white/15 hover:border-white/30 bg-white/[0.02]"}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
        >
          <Upload className="h-8 w-8 mx-auto text-white/30 mb-2" />
          <p className="text-sm text-white/50">Drop an image here, click to upload, or paste from clipboard</p>
          <p className="text-xs text-white/30 mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ""; // reset to allow re-selecting same file
        }}
      />
    </div>
  );
}

/* ──────────────── TASK FORM ──────────────── */

function TaskForm({ task, onDone }: { task: Task | null; onDone: () => void }) {
  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(task?.description ?? "");
  const [status, setStatus] = React.useState<Task["status"]>(task?.status ?? "backlog");
  const [priority, setPriority] = React.useState<Task["priority"]>(task?.priority ?? "medium");
  const [tags, setTags] = React.useState(task?.tags ?? "");
  const [dueDate, setDueDate] = React.useState(task?.dueDate ? task.dueDate.slice(0, 10) : "");
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      const payload: Record<string, unknown> = { title, description, status, priority, tags };
      if (dueDate) payload.dueDate = new Date(dueDate).toISOString();
      else payload.dueDate = null;

      const res = await fetch(task ? `/api/tasks/${task.id}` : "/api/tasks", {
        method: task ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
        return;
      }
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
        <select value={status} onChange={(e) => setStatus(e.target.value as Task["status"])} className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">
          <option value="backlog">Backlog</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-white/50 mb-1 block">Due Date</label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl border-white/10 bg-white/5 text-white"
        />
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
