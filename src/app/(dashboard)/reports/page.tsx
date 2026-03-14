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
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent report activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.reports.length ? (
            snapshot.reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background/70 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{report.title}</p>
                  <p className="text-sm text-muted-foreground">
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
    </>
  );
}
