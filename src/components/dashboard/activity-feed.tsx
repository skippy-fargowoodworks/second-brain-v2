"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ListTodo,
  NotebookText,
  MessageSquare,
  Pencil,
  Users,
  Activity,
  FileText,
  CalendarCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ActivityItem = {
  id: string;
  entity: string;
  entityId?: string | null;
  message: string;
  createdAt: string | Date;
};

type ActivityFeedProps = {
  activities: ActivityItem[];
};

const ENTITY_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; route: string }
> = {
  task: { icon: ListTodo, route: "tasks" },
  note: { icon: NotebookText, route: "notes" },
  conversation: { icon: MessageSquare, route: "conversations" },
  working: { icon: Pencil, route: "working-notes" },
  family: { icon: Users, route: "family" },
  decision: { icon: FileText, route: "decisions" },
  habit: { icon: CalendarCheck, route: "habits" },
};

const ACTION_STYLES: Record<string, string> = {
  Created: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-100",
  Updated: "border border-blue-500/30 bg-blue-500/15 text-blue-100",
  Completed: "border border-teal-500/30 bg-teal-500/15 text-teal-100",
  Deleted: "border border-rose-500/30 bg-rose-500/15 text-rose-100",
  Logged: "border border-amber-500/30 bg-amber-500/15 text-amber-100",
};

const ACTIONS = ["Created", "Updated", "Completed", "Deleted", "Logged"] as const;

function getActionLabel(message: string) {
  for (const action of ACTIONS) {
    const regex = new RegExp(`\\b${action}\\b`, "i");
    if (regex.test(message)) return action;
  }
  return "Logged";
}

function getActivityHref(activity: ActivityItem) {
  const entityKey = activity.entity.toLowerCase();
  const route = ENTITY_META[entityKey]?.route ?? `${entityKey}s`;
  if (activity.entityId) {
    return `/${route}/${activity.entityId}`;
  }
  return `/${route}`;
}

function getEntityIcon(entity: string) {
  const entityKey = entity.toLowerCase();
  return ENTITY_META[entityKey]?.icon ?? Activity;
}

function getRelativeTime(createdAt: string | Date) {
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [visibleCount, setVisibleCount] = React.useState(20);

  const visibleActivities = React.useMemo(
    () => activities.slice(0, visibleCount),
    [activities, visibleCount]
  );

  return (
    <Card className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="kicker text-[11px] font-medium text-white/55">ACTIVITY FEED</div>
          <div className="mt-1 text-sm text-white/45">Latest changes across your space</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {visibleActivities.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/45">
            No activity yet.
          </div>
        ) : (
          visibleActivities.map((activity) => {
            const Icon = getEntityIcon(activity.entity);
            const action = getActionLabel(activity.message);
            return (
              <Link
                key={activity.id}
                href={getActivityHref(activity)}
                className="group block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={ACTION_STYLES[action]}>{action}</Badge>
                        <span className="text-xs font-medium uppercase tracking-wide text-white/50">
                          {activity.entity}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-white/90">{activity.message}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-white/45">
                    {getRelativeTime(activity.createdAt)}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {visibleCount < activities.length ? (
        <Button
          variant="secondary"
          className="mt-4 w-full rounded-xl bg-white/5 text-white/80 hover:bg-white/8"
          onClick={() => setVisibleCount((count) => count + 20)}
        >
          Load More
        </Button>
      ) : null}
    </Card>
  );
}
