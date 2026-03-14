import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { formatCurrency } from "@/lib/utils";

export default async function CashPage() {
  const snapshot = await getDashboardSnapshot();
  const criticalEntities = snapshot.positions.filter((item) => item.status !== "healthy");
  const totalAvailable = snapshot.positions.reduce((sum, item) => sum + item.available, 0);

  return (
    <>
      <PageHeader
        eyebrow="Cash Position"
        title="Live global cash view"
        description="Review balances, projected position shifts, and entities at or near operating thresholds."
        meta={["Entity balances", "Threshold watch", "Multi-bank"]}
      />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Position signal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Available across visible entities</p>
              <p className="mt-3 font-display text-5xl font-semibold">{formatCurrency(totalAvailable)}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Entities monitored</p>
                <p className="mt-2 text-2xl font-semibold">{snapshot.positions.length}</p>
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Needs attention</p>
                <p className="mt-2 text-2xl font-semibold">{criticalEntities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entity and bank balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.positions.length ? (
              snapshot.positions.map((position) => (
                <div
                  key={`${position.entity}-${position.bank}`}
                  className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
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
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Available</p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        {formatCurrency(position.available, position.currency)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Projected</p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        {formatCurrency(position.projected, position.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No cash balances loaded"
                description="Import bank activity and generate a cash snapshot to populate this view."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
