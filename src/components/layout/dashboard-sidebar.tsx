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
    <aside className="glass-panel flex min-w-0 flex-col rounded-[2rem] border border-white/70 p-4 shadow-[0_28px_70px_rgba(17,30,64,0.08)] xl:sticky xl:top-24 xl:p-5">
      <div className="dark-panel min-w-0 rounded-[1.6rem] p-4 text-primary-foreground md:p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/60">
          Active tenant
        </p>
        <p className="mt-3 break-words font-display text-xl font-semibold leading-tight md:text-2xl">
          {session.organization.name}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-primary-foreground/80">
          <span className="break-words">{session.user.name}</span>
          <Badge className="max-w-full whitespace-normal break-words bg-white/15 text-primary-foreground">
            {session.user.role}
          </Badge>
        </div>
      </div>

      <nav className="mt-4 grid gap-2 sm:grid-cols-2 xl:mt-6 xl:grid-cols-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "default" }),
                "h-auto w-full min-w-0 justify-start whitespace-normal rounded-[1.4rem] px-3.5 py-3 text-left md:px-4 md:py-4",
                isActive
                  ? "border border-secondary/60 bg-secondary/90 shadow-[0_14px_28px_rgba(171,120,25,0.12)]"
                  : "hover:border hover:border-white/70"
              )}
            >
              <div className="min-w-0 w-full">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <p className="min-w-0 break-words font-display text-base font-semibold leading-tight">
                    {item.title}
                  </p>
                  {isActive ? (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-foreground" />
                  ) : null}
                </div>
                <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      <form action={signOutAction} className="mt-4 pt-2 xl:mt-auto xl:pt-6">
        <Button type="submit" variant="outline" className="w-full sm:w-auto xl:w-full">
          Sign out
        </Button>
      </form>
    </aside>
  );
}
