import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { formatCurrency } from "@/lib/utils";

export default async function RiskPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <>
      <PageHeader
        eyebrow="Risk"
        title="Exposure and risk monitoring"
        description="Track open currency exposure, hedge coverage, and current risk signals that influence treasury actions."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Open exposures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.exposures.length ? (
              snapshot.exposures.map((exposure) => (
                <div
                  key={exposure.currency}
                  className="grid gap-4 rounded-xl border border-border bg-background/70 p-5 md:grid-cols-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Currency
                    </p>
                    <p className="mt-2 text-xl font-semibold">{exposure.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Gross</p>
                    <p className="mt-2 font-semibold">{formatCurrency(exposure.gross)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Hedged
                    </p>
                    <p className="mt-2 font-semibold">{formatCurrency(exposure.hedged)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open</p>
                    <p className="mt-2 font-semibold">{formatCurrency(exposure.open)}</p>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No open exposures"
                description="Load exposure measurements or hedge data to monitor currency and funding risk here."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.alerts.length ? (
              snapshot.alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-2">
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
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No risk alerts"
                description="When monitoring or control exceptions are detected, they will surface in this watchlist."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
