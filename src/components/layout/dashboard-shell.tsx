import type { ReactNode } from "react";

import type { AppSession } from "@/lib/auth";

type DashboardShellProps = {
  sidebar: ReactNode;
  session: AppSession;
  children: ReactNode;
};

export function DashboardShell({
  sidebar,
  session,
  children
}: DashboardShellProps) {
  return (
    <main className="container py-8">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-5 shadow-panel md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Treasury operations workspace
          </p>
          <p className="mt-2 text-xl font-semibold">
            Welcome back, {session.user.name.split(" ")[0]}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor liquidity, approvals, risk, and banking connectivity from one surface.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <span>Role: {session.user.role}</span>
          <span>Workspace: {session.organization.name}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div>{sidebar}</div>
        <div className="space-y-6">{children}</div>
      </div>
    </main>
  );
}
