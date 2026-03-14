import Link from "next/link";
import { ArrowRight, ShieldCheck, Workflow, WalletCards } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marketingHighlights } from "@/data/demo-data";
import { cn } from "@/lib/utils";

const proofPoints = [
  {
    title: "Cash positioning",
    detail: "Balances, entities, and currencies in one operating model.",
    icon: WalletCards
  },
  {
    title: "Controlled workflows",
    detail: "Policy-driven approvals with traceable release steps.",
    icon: Workflow
  },
  {
    title: "Audit-ready controls",
    detail: "Tenant-aware security, approvals, and operational evidence.",
    icon: ShieldCheck
  }
];

export default function MarketingPage() {
  return (
    <main className="container py-16 md:py-24">
      <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Enterprise treasury platform
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
            Replace spreadsheet treasury with a live command center.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            This implementation turns the SRS into a working Next.js and Supabase application
            scaffold for cash visibility, forecasting, approvals, reporting, and connector
            health.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/sign-in"
              className={cn(buttonVariants({ variant: "default" }), "justify-center gap-2")}
            >
              Enter the workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline" }), "justify-center")}
            >
              View dashboard
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden border-0 bg-slate-950 text-slate-50 shadow-2xl">
          <CardHeader className="border-b border-white/10 pb-5">
            <p className="text-xs uppercase tracking-[0.25em] text-teal-300">
              Today&apos;s treasury posture
            </p>
            <CardTitle className="text-3xl text-white">$128.5M global cash</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            {marketingHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="font-semibold">{highlight.title}</p>
                <p className="mt-2 text-sm text-slate-300">{highlight.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {proofPoints.map((point) => {
          const Icon = point.icon;
          return (
            <Card key={point.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="pt-4">{point.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{point.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
