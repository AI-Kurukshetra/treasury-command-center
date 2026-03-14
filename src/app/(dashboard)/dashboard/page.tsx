import {
  AlertTriangle,
  ArrowRightLeft,
  Bot,
  LayoutDashboard,
  Landmark,
  Radar,
  ReceiptText,
  ShieldCheck
} from "lucide-react";

import { CashTrendChart } from "@/components/charts/cash-trend-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/layout/page-header";
import { ActionCard } from "@/components/operations/action-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardsPayload, getNotificationsPayload } from "@/lib/domain/treasury-api";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { formatCurrency } from "@/lib/utils";

const icons = [Landmark, ArrowRightLeft, ShieldCheck, AlertTriangle];

type DashboardRecord = {
  id: string;
  name: string;
  is_default: boolean;
  updated_at: string;
};

type WidgetRecord = {
  id: string;
  dashboard_id: string;
  widget_type: string;
  title: string;
  position_index: number;
};

type QueryRecord = {
  id: string;
  title: string;
  prompt_text: string;
  response_text: string | null;
  status: string;
  updated_at: string;
};

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  severity: string;
  status: string;
  created_at: string;
};

type MobileDeviceRecord = {
  id: string;
  device_label: string;
  platform: string;
  biometric_enabled: boolean;
  last_seen_at: string | null;
  status: string;
};

export default async function DashboardPage() {
  const [snapshot, dashboardWorkspace, notificationsWorkspace] = await Promise.all([
    getDashboardSnapshot(),
    getDashboardsPayload(),
    getNotificationsPayload()
  ]);
  const dashboards = dashboardWorkspace.dashboards as DashboardRecord[];
  const widgets = dashboardWorkspace.widgets as WidgetRecord[];
  const queries = dashboardWorkspace.queries as QueryRecord[];
  const notifications = notificationsWorkspace.notifications as NotificationRecord[];
  const mobileDevices = notificationsWorkspace.mobileDevices as MobileDeviceRecord[];

  return (
    <>
      <PageHeader
        eyebrow="Executive View"
        title="Global treasury overview"
        description="A redesigned executive surface for cash visibility, forecast confidence, approval routing, connector health, and risk posture."
        meta={["Live operating view", "Policy-aware", "Multi-entity"]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.stats.map((stat, index) => {
          const Icon = icons[index] ?? Landmark;

          return (
            <div key={stat.label} className="relative">
              <div className="absolute right-6 top-6 rounded-[1rem] bg-primary/8 p-2.5 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <MetricCard item={stat} />
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardTitle>13-week liquidity curve</CardTitle>
            <CardDescription>
              Actual and forecast movement in reporting currency with a cleaner signal-to-noise
              ratio.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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

        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Critical alert rail</CardTitle>
            <CardDescription className="text-white/70">
              Escalations and exceptions requiring treasury attention right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.alerts.length ? (
              snapshot.alerts.map((alert) => (
                <div key={alert.id} className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg font-semibold">{alert.title}</p>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "warning"
                            ? "warning"
                            : "outline"
                      }
                      className={
                        alert.severity === "info" ? "border-white/15 bg-white/10 text-white/80" : ""
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/72">{alert.detail}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                    <Radar className="h-3.5 w-3.5" />
                    {alert.action}
                  </div>
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

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cash posture by entity</CardTitle>
            <CardDescription>
              Current and projected liquidity position for the entities that matter today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.positions.length ? (
              snapshot.positions.map((position) => (
                <div
                  key={`${position.entity}-${position.bank}`}
                  className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-xl font-semibold">{position.entity}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{position.bank}</p>
                    </div>
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
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Available
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        {formatCurrency(position.available, position.currency)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Projected
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        {formatCurrency(position.projected, position.currency)}
                      </p>
                    </div>
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
            <CardDescription>
              Release-ready items, escalations, and bottlenecks across the payment flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.payments.length ? (
              snapshot.payments.map((payment) => (
                <div key={payment.id} className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold">{payment.beneficiary}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{payment.id}</p>
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
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Amount
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Due date
                      </p>
                      <p className="mt-2 text-base font-semibold">{payment.dueDate}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {payment.approvalsRemaining} approvals remaining before release.
                  </p>
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Dashboard personalization</CardTitle>
                <CardDescription>
                  Named executive views, default workspace selection, and widget-level composition.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboards.length ? (
              dashboards.map((dashboard) => {
                const widgetCount = widgets.filter((widget) => widget.dashboard_id === dashboard.id).length;

                return (
                  <div
                    key={dashboard.id}
                    className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold">{dashboard.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {widgetCount} widgets · updated {dashboard.updated_at.slice(0, 10)}
                        </p>
                      </div>
                      <Badge variant={dashboard.is_default ? "success" : "secondary"}>
                        {dashboard.is_default ? "default" : "named view"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <SectionEmpty
                title="No dashboards configured yet"
                description="Create a default operator dashboard before adding widgets or personalized layouts."
              />
            )}
          </CardContent>
        </Card>

        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/10 text-secondary">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-white">Treasury query surface</CardTitle>
                <CardDescription className="text-white/70">
                  Natural-language prompts resolved into an operator-ready response history.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {queries.length ? (
              queries.slice(0, 3).map((query) => (
                <div key={query.id} className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-lg font-semibold text-white">{query.title}</p>
                    <Badge
                      variant="outline"
                      className="border-white/15 bg-white/10 text-white/80"
                    >
                      {query.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/70">{query.prompt_text}</p>
                  <p className="mt-4 text-sm leading-6 text-white/85">{query.response_text}</p>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No query history yet"
                description="Ask a treasury question to populate reusable query context for the operator team."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <ActionCard
          title="Create dashboard"
          description="Stand up a named workspace and optionally make it the default command view."
          endpoint="/api/dashboards"
          submitLabel="Create dashboard"
          payloadDefaults={{ recordType: "dashboard", isDefault: "true" }}
          fields={[
            { name: "name", label: "Dashboard name", placeholder: "Morning liquidity watch" }
          ]}
        />
        <ActionCard
          title="Add widget"
          description="Add a high-signal widget to the default dashboard or a specified dashboard id."
          endpoint="/api/dashboards"
          submitLabel="Add widget"
          payloadDefaults={{ recordType: "widget" }}
          fields={[
            { name: "title", label: "Widget title", placeholder: "Top liquidity entities" },
            {
              name: "widgetType",
              label: "Widget type",
              type: "select",
              options: [
                { label: "KPI", value: "kpi" },
                { label: "Chart", value: "chart" },
                { label: "Queue", value: "queue" },
                { label: "Feed", value: "feed" }
              ]
            },
            { name: "dashboardId", label: "Dashboard id (optional)", placeholder: dashboards[0]?.id ?? "Uses default dashboard" }
          ]}
        />
        <ActionCard
          title="Ask treasury query"
          description="Capture a natural-language question and save the generated operating answer."
          endpoint="/api/query"
          submitLabel="Run query"
          fields={[
            { name: "title", label: "Saved title", placeholder: "Daily payments posture" },
            {
              name: "promptText",
              label: "Prompt",
              type: "textarea",
              placeholder: "What requires attention across payments, reports, and integrations today?"
            }
          ]}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>FX exposure posture</CardTitle>
                <CardDescription>Open versus hedged exposure by major currency.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.exposures.map((exposure) => (
              <div
                key={exposure.currency}
                className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-xl font-semibold">{exposure.currency}</p>
                  <p className="text-sm text-muted-foreground">
                    Open {formatCurrency(exposure.open, exposure.currency)}
                  </p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(exposure.hedged / exposure.gross) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-secondary text-secondary-foreground">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Reporting output</CardTitle>
                <CardDescription>Generated packs and queued board-facing deliverables.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.reports.map((report) => (
              <div
                key={report.id}
                className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{report.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{report.type}</p>
                  </div>
                  <Badge variant={report.status === "ready" ? "success" : "warning"}>
                    {report.status}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{report.generatedAt}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-accent text-accent-foreground">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Integration watch</CardTitle>
                <CardDescription>Provider status and the last known synchronization signal.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.integrations.map((integration) => (
              <div
                key={integration.provider}
                className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{integration.provider}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{integration.type}</p>
                  </div>
                  <Badge
                    variant={
                      integration.status === "healthy"
                        ? "success"
                        : integration.status === "error"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {integration.status}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{integration.lastSync}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Alert command rail</CardTitle>
            <CardDescription>
              Critical alerts and operator-generated notifications that shape day-to-day treasury action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.length ? (
              notifications.slice(0, 6).map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                    </div>
                    <Badge
                      variant={
                        notification.severity === "critical"
                          ? "destructive"
                          : notification.severity === "warning"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {notification.severity}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {notification.status} · {notification.created_at.slice(0, 19)}
                  </p>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No notification trail yet"
                description="Critical alerts and operator-published messages will accumulate here."
              />
            )}
          </CardContent>
        </Card>

        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Mobile and biometric posture</CardTitle>
            <CardDescription className="text-white/70">
              Device registration and biometric readiness for approvals on the move.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mobileDevices.length ? (
              mobileDevices.map((device) => (
                <div key={device.id} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{device.device_label}</p>
                      <p className="mt-1 text-sm text-white/70">
                        {device.platform} · last seen {device.last_seen_at?.slice(0, 19) ?? "Never"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/15 bg-white/10 text-white/80"
                    >
                      {device.biometric_enabled ? "biometric" : "password only"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/60">{device.status}</p>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No devices registered"
                description="Register a mobile device to demonstrate remote approvals with biometric posture."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ActionCard
          title="Publish manual alert"
          description="Push a treasury alert into the command rail for critical operational follow-up."
          endpoint="/api/notifications"
          submitLabel="Create alert"
          payloadDefaults={{ recordType: "notification" }}
          fields={[
            { name: "title", label: "Title", placeholder: "Funding cutoff approaching" },
            { name: "body", label: "Body", type: "textarea", placeholder: "Review release queue before 15:00 UTC." },
            {
              name: "severity",
              label: "Severity",
              type: "select",
              options: [
                { label: "Info", value: "info" },
                { label: "Warning", value: "warning" },
                { label: "Critical", value: "critical" }
              ]
            }
          ]}
        />
        <ActionCard
          title="Register mobile device"
          description="Track mobile approval posture and biometric readiness for the signed-in operator."
          endpoint="/api/notifications"
          submitLabel="Register device"
          payloadDefaults={{ recordType: "mobile_device" }}
          fields={[
            { name: "deviceLabel", label: "Device label", placeholder: "Treasurer iPhone" },
            { name: "platform", label: "Platform", placeholder: "iOS" },
            {
              name: "biometricEnabled",
              label: "Biometric enabled",
              type: "select",
              options: [
                { label: "True", value: "true" },
                { label: "False", value: "false" }
              ],
              defaultValue: "true"
            }
          ]}
        />
      </section>
    </>
  );
}
