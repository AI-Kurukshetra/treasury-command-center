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
    <main className="container py-8 md:py-10">
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(8,18,43,0.98),rgba(19,37,74,0.96)_58%,rgba(18,91,76,0.94))] p-6 text-white shadow-[0_34px_90px_rgba(12,20,45,0.24)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white/70">
              Treasury control tower
            </p>
            <p className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Run liquidity, risk, approvals, and banking from one sharp operating surface.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              Welcome back, {session.user.name.split(" ")[0]}. Today&apos;s workspace is tuned for
              fast signal detection, cleaner workflow routing, and better executive visibility.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Role</p>
              <p className="mt-2 text-lg font-semibold">{session.user.role}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Workspace</p>
              <p className="mt-2 text-lg font-semibold">{session.organization.name}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-sm md:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Operational mode</p>
              <p className="mt-2 text-lg font-semibold">Live monitoring with policy-aware actions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div>{sidebar}</div>
        <div className="space-y-6">{children}</div>
      </div>
    </main>
  );
}
