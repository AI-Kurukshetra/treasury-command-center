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
    <aside className="glass-panel sticky top-24 flex h-full flex-col rounded-[2rem] border border-white/70 p-5 shadow-[0_28px_70px_rgba(17,30,64,0.08)]">
      <div className="dark-panel rounded-[1.6rem] p-5 text-primary-foreground">
        <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/60">
          Active tenant
        </p>
        <p className="mt-3 font-display text-2xl font-semibold">{session.organization.name}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-primary-foreground/80">
          <span>{session.user.name}</span>
          <Badge className="bg-white/15 text-primary-foreground">{session.user.role}</Badge>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "default" }),
                "h-auto w-full justify-start rounded-[1.4rem] px-4 py-4 text-left",
                isActive
                  ? "border border-secondary/60 bg-secondary/90 shadow-[0_14px_28px_rgba(171,120,25,0.12)]"
                  : "hover:border hover:border-white/70"
              )}
            >
              <div className="w-full">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-base font-semibold">{item.title}</p>
                  {isActive ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-accent-foreground" />
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
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
