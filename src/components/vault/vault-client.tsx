"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Pencil, Copy, KeyRound } from "lucide-react";

type Credential = {
  id: string;
  service: string;
  username: string;
  password: string;
  notes: string | null;
  updatedAt: string;
  createdAt: string;
};

export function VaultClient({ initialCredentials }: { initialCredentials: Credential[] }) {
  const [items, setItems] = React.useState<Credential[]>(initialCredentials);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Credential | null>(null);

  async function refresh() {
    const res = await fetch("/api/credentials", { cache: "no-store" });
    const data = (await res.json()) as Credential[];
    setItems(data);
  }

  async function remove(id: string) {
    if (!confirm("Delete this credential?")) return;
    const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
    if (!res.ok) return toast.error("Failed to delete");
    toast("Deleted");
    await refresh();
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="kicker text-[11px] font-medium text-white/55">VAULT</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Vault</h1>
          <p className="mt-2 text-sm text-white/55">Secure credential storage (local SQLite).</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}>
          <DialogTrigger asChild>
            <Button className="h-10 rounded-xl bg-amber-500/70 hover:bg-amber-500">
              <Plus className="mr-2 h-4 w-4" /> New Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-slate-950/80 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Credential" : "New Credential"}</DialogTitle>
            </DialogHeader>
            <CredentialForm
              credential={editing}
              onDone={async () => {
                setOpen(false);
                setEditing(null);
                await refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((c) => (
          <Card key={c.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-amber-300" />
                  <div className="text-lg font-semibold">{c.service}</div>
                </div>
                <div className="mt-2 text-sm text-white/60">{c.username}</div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl bg-white/5 hover:bg-white/10"
                    onClick={() => copy(c.username)}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy User
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-xl bg-white/5 hover:bg-white/10"
                    onClick={() => copy(c.password)}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Pass
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {c.notes ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/20 p-3 text-sm text-white/70">
                {c.notes}
              </div>
            ) : null}
          </Card>
        ))}

        {items.length === 0 && (
          <Card className="glass rounded-2xl p-10 text-center text-sm text-white/45">
            No credentials yet.
          </Card>
        )}
      </div>

      <div className="text-xs text-white/45">
        <Badge className="border-white/10 bg-white/5 text-white/70">Note</Badge> Vault is stored in SQLite. For true security, encrypt at rest before using in production.
      </div>
    </div>
  );
}

function CredentialForm({
  credential,
  onDone,
}: {
  credential: Credential | null;
  onDone: () => void;
}) {
  const [service, setService] = React.useState(credential?.service ?? "");
  const [username, setUsername] = React.useState(credential?.username ?? "");
  const [password, setPassword] = React.useState(credential?.password ?? "");
  const [notes, setNotes] = React.useState(credential?.notes ?? "");
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      const payload = { service, username, password, notes };
      const res = await fetch(credential ? `/api/credentials/${credential.id}` : "/api/credentials", {
        method: credential ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      toast(credential ? "Credential updated" : "Credential saved");
      onDone();
    } catch {
      toast.error("Failed to save");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="Service" className="rounded-xl border-white/10 bg-white/5" />
      <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="rounded-xl border-white/10 bg-white/5" />
      <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="rounded-xl border-white/10 bg-white/5" />
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-h-[120px] rounded-xl border-white/10 bg-white/5" />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" className="rounded-xl bg-white/5 hover:bg-white/10" onClick={onDone}>
          Cancel
        </Button>
        <Button disabled={pending} className="rounded-xl bg-amber-500/70 hover:bg-amber-500" onClick={submit}>
          Save
        </Button>
      </div>
    </div>
  );
}
