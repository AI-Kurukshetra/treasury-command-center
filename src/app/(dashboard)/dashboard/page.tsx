import { AlertTriangle, ArrowRightLeft, Landmark, ShieldCheck } from "lucide-react";

import { CashTrendChart } from "@/components/charts/cash-trend-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { formatCurrency } from "@/lib/utils";

const icons = [Landmark, ArrowRightLeft, ShieldCheck, AlertTriangle];

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <>
      <PageHeader
        eyebrow="Executive View"
        title="Global treasury overview"
        description="Monitor cash, forecast quality, payment throughput, and risk posture from a single operating surface."
        meta={["Real-time view", "Audit ready", "Multi-entity"]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.stats.map((stat, index) => {
          const Icon = icons[index] ?? Landmark;

          return (
            <div key={stat.label} className="relative">
              <div className="absolute right-5 top-5 rounded-xl bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <MetricCard item={stat} />
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>13-week liquidity trend</CardTitle>
            <CardDescription>
              Forecasted and actual treasury movement in reporting currency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.forecasts.length ? (
              <CashTrendChart data={snapshot.forecasts} />
            ) : (
              <SectionEmpty
                title="No forecast data yet"
                description="Create a forecast and load forecast lines to visualize your liquidity curve."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical alerts</CardTitle>
            <CardDescription>Items that need immediate treasury attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.alerts.length ? (
              snapshot.alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{alert.title}</p>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "warning"
                            ? "warning"
                            : "default"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{alert.detail}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {alert.action}
                  </p>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No active alerts"
                description="Critical liquidity, risk, and integration alerts will appear here once monitoring data is flowing."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cash position by entity</CardTitle>
            <CardDescription>Current and projected liquidity posture by operating unit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.positions.length ? (
              snapshot.positions.map((position) => (
                <div
                  key={`${position.entity}-${position.bank}`}
                  className="grid gap-3 rounded-xl border border-border bg-background/70 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]"
                >
                  <div>
                    <p className="font-medium">{position.entity}</p>
                    <p className="text-sm text-muted-foreground">{position.bank}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Available
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(position.available, position.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Projected
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(position.projected, position.currency)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant={
                        position.status === "critical"
                          ? "destructive"
                          : position.status === "watch"
                            ? "warning"
                            : "success"
                      }
                    >
                      {position.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No cash positions available"
                description="Load a cash snapshot and related line items to render live balances by entity and account."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval queue</CardTitle>
            <CardDescription>Payments approaching release or escalation thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.payments.length ? (
              snapshot.payments.map((payment) => (
                <div key={payment.id} className="rounded-xl border border-border bg-background/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{payment.beneficiary}</p>
                      <p className="text-sm text-muted-foreground">{payment.id}</p>
                    </div>
                    <Badge
                      variant={
                        payment.status === "approved"
                          ? "success"
                          : payment.status === "at-risk"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{formatCurrency(payment.amount, payment.currency)}</span>
                    <span className="text-muted-foreground">
                      {payment.approvalsRemaining} approvals remaining
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No queued payments"
                description="Submitted and approved payment items will appear here once payment workflows are active."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
