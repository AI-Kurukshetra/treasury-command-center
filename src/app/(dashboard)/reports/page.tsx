import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";

export default async function ReportsPage() {
  const snapshot = await getDashboardSnapshot();

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
              <p className="mt-3 font-display text-4xl font-semibold">{snapshot.reports.length}</p>
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
            {snapshot.reports.length ? (
              snapshot.reports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-white/68 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-display text-xl font-semibold">{report.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {report.type} · {report.generatedAt}
                    </p>
                  </div>
                  <Badge variant={report.status === "ready" ? "success" : "warning"}>
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
    </>
  );
}
