import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { getAppSession } from "@/lib/auth";
import { getNavigation } from "@/lib/domain/treasury";

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getAppSession();
  if (!session) {
    redirect("/auth/sign-in");
  }

  const items = await getNavigation();

  return (
    <DashboardShell
      session={session}
      sidebar={<DashboardSidebar items={items} session={session} />}
    >
      {children}
    </DashboardShell>
  );
}
