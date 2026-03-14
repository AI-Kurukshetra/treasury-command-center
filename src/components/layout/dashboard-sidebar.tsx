"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/features/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppSession } from "@/lib/auth";
import type { NavItem } from "@/types/treasury";

type DashboardSidebarProps = {
  items: NavItem[];
  session: AppSession;
};

export function DashboardSidebar({ items, session }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-panel">
      <div className="rounded-xl bg-primary p-4 text-primary-foreground">
        <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/80">
          Active tenant
        </p>
        <p className="mt-2 text-lg font-semibold">{session.organization.name}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-primary-foreground/80">
          <span>{session.user.name}</span>
          <Badge className="bg-white/20 text-primary-foreground">{session.user.role}</Badge>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "default" }),
                "h-auto w-full justify-start px-3 py-3 text-left"
              )}
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <form action={signOutAction} className="mt-auto pt-6">
        <Button type="submit" variant="outline" className="w-full">
          Sign out
        </Button>
      </form>
    </aside>
  );
}
