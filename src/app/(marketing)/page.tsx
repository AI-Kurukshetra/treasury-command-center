import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Globe2,
  Radar,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marketingHighlights } from "@/data/demo-data";
import { cn, formatCurrency } from "@/lib/utils";

const operatingPillars = [
  {
    title: "Position intelligence",
    detail: "Balances, concentration, and entity-level movement in one coherent command surface.",
    icon: BadgeDollarSign
  },
  {
    title: "Workflow control",
    detail: "Approvals, exception routing, and policy execution without spreadsheet handoffs.",
    icon: Workflow
  },
  {
    title: "Risk visibility",
    detail: "Exposure watchlists, hedge posture, and liquidity stress indicators in context.",
    icon: Radar
  }
];

const executionMoments = [
  "Morning liquidity sweep and concentration review",
  "Payment release readiness with approval bottleneck detection",
  "Midday connector health and bank ingestion monitoring",
  "Board-ready forecast, compliance, and cash reporting outputs"
];

const heroStats = [
  { label: "Global cash monitored", value: formatCurrency(128450000) },
  { label: "Payments in controlled queue", value: "43 live items" },
  { label: "Connector health coverage", value: "18 institutions" }
];

export default function MarketingPage() {
  return (
    <main className="container pb-20 pt-12 md:pb-28 md:pt-20">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground shadow-[0_14px_30px_rgba(17,30,64,0.08)]">
            <Sparkles className="h-4 w-4 text-primary" />
            Built for treasury teams operating at scale
          </div>
          <h1 className="mt-7 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
            Treasury software that looks and behaves like a control room, not a form dump.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Treasury Command Center centralizes cash visibility, approvals, forecasting,
            integrations, and risk into a sharper operating experience for finance teams that
            need speed and control at the same time.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/sign-in"
              className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2")}
            >
              Enter the workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Explore executive dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-white/70 bg-white/72 p-5 shadow-[0_22px_50px_rgba(17,30,64,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-3 font-display text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dark-panel relative overflow-hidden rounded-[2rem] border border-slate-800 p-6 text-white shadow-[0_40px_110px_rgba(12,20,45,0.26)] md:p-8">
          <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70">
            Live operating posture
          </div>
          <div className="mt-8 grid gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                Treasury command signal
              </p>
              <p className="mt-3 font-display text-4xl font-semibold">$128.5M</p>
              <p className="mt-2 text-sm text-white/70">Global cash across entities and banks</p>
            </div>

            {marketingHighlights.map((highlight, index) => (
              <div
                key={highlight.title}
                className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/6 p-4 md:grid-cols-[auto_1fr]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/80">
                  {index === 0 ? (
                    <Globe2 className="h-5 w-5" />
                  ) : index === 1 ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <Activity className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">{highlight.title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/70">{highlight.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {operatingPillars.map((pillar) => {
          const Icon = pillar.icon;

          return (
            <Card key={pillar.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="pt-2">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{pillar.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/72 p-7 shadow-[0_24px_60px_rgba(17,30,64,0.08)]">
          <p className="section-label">Daily treasury rhythm</p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight">
            The platform is designed around the actual operating cadence of treasury.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Instead of hiding capability behind generic cards and shallow dashboards, the product
            should foreground the moments treasury teams repeat every day.
          </p>
        </div>

        <div className="grid gap-4">
          {executionMoments.map((moment, index) => (
            <div
              key={moment}
              className="glass-panel rounded-[1.6rem] border border-white/70 p-5 shadow-[0_20px_50px_rgba(17,30,64,0.07)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  {index + 1}
                </div>
                <div>
                  <p className="font-display text-xl font-semibold">{moment}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Instrumented, policy-aware, and connected to the same tenant-wide data model.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
