import { PageHeader } from "@/components/layout/page-header";
import { ActionCard } from "@/components/operations/action-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getReportsPayload } from "@/lib/domain/treasury-api";

type ReportRecord = {
  id: string;
  report_type: string;
  created_at: string;
  status: string;
  storage_key: string | null;
};

type AuditLogRecord = {
  id: string;
  action: string;
  entity_type: string;
  severity: string;
  occurred_at: string;
};

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  severity: string;
};

export default async function ReportsPage() {
  const reportsPayload = await getReportsPayload();
  const reports = reportsPayload.reports as ReportRecord[];
  const auditLogs = reportsPayload.auditLogs as AuditLogRecord[];
  const notifications = reportsPayload.notifications as NotificationRecord[];

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Treasury reporting center"
        description="Generate and distribute cash, forecast, and compliance outputs without leaving the operating workspace."
        meta={["Board-ready", "Compliance packs", "Operational exports"]}
      />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Distribution cadence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Visible outputs</p>
              <p className="mt-3 font-display text-4xl font-semibold">{reports.length}</p>
            </div>
            <p className="text-sm leading-7 text-white/72">
              Cash, forecast, and compliance reporting should feel like an extension of the
              treasury operating workflow, not a detached export tool.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent report activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.length ? (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-white/68 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-display text-xl font-semibold">{report.report_type}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {report.id.slice(0, 8)} · {report.created_at.slice(0, 10)}
                    </p>
                  </div>
                  <Badge variant={report.status === "generated" ? "success" : "warning"}>
                    {report.status}
                  </Badge>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No reports generated yet"
                description="Run a cash, forecast, or compliance report to start building the reporting history."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <ActionCard
          title="Generate compliance report"
          description="Create a dated treasury compliance or audit pack record."
          endpoint="/api/reports"
          submitLabel="Generate report"
          fields={[
            {
              name: "reportType",
              label: "Report type",
              type: "select",
              options: [
                { label: "Cash position", value: "cash_position" },
                { label: "Forecast", value: "forecast" },
                { label: "Compliance", value: "compliance" },
                { label: "Audit", value: "audit" }
              ]
            },
            { name: "periodStart", label: "Period start", type: "date" },
            { name: "periodEnd", label: "Period end", type: "date" }
          ]}
        />

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Audit trail highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLogs.length ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col gap-3 rounded-[1.35rem] border border-border/70 bg-white/68 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.entity_type} · {log.occurred_at.slice(0, 10)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      log.severity === "critical"
                        ? "destructive"
                        : log.severity === "warning"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {log.severity}
                  </Badge>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No audit events yet"
                description="Operator actions, report generation, and sensitive workflow changes will accumulate here."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reporting notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                    </div>
                    <Badge variant={notification.severity === "critical" ? "destructive" : "secondary"}>
                      {notification.severity}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No reporting notifications"
                description="Generated report alerts and downstream follow-up items will appear here."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
