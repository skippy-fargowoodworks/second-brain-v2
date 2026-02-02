import * as React from "react";
import { Sidebar } from "@/components/shell/sidebar";

export function PageShell({
  children,
  status,
}: {
  children: React.ReactNode;
  status: "working" | "idle";
}) {
  return (
    <div className="app-shell min-h-screen text-white">
      <Sidebar status={status} />

      <main className="relative ml-[76px]">
        <div className="mx-auto max-w-7xl px-5 py-8">{children}</div>
      </main>
    </div>
  );
}
