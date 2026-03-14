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
        meta={["Exposure watch", "Hedge posture", "Alert driven"]}
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
                  className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Currency</p>
                      <p className="mt-2 font-display text-2xl font-semibold">{exposure.currency}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Open {formatCurrency(exposure.open, exposure.currency)}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Gross</p>
                      <p className="mt-2 font-semibold">{formatCurrency(exposure.gross)}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hedged</p>
                      <p className="mt-2 font-semibold">{formatCurrency(exposure.hedged)}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open</p>
                      <p className="mt-2 font-semibold">{formatCurrency(exposure.open)}</p>
                    </div>
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

        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Risk watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.alerts.length ? (
              snapshot.alerts.map((alert) => (
                <div key={alert.id} className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-lg font-semibold">{alert.title}</p>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "warning"
                            ? "warning"
                            : "outline"
                      }
                      className={alert.severity === "info" ? "border-white/15 bg-white/10 text-white/80" : ""}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/72">{alert.detail}</p>
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
