import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { formatCurrency } from "@/lib/utils";

export default async function CashPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <>
      <PageHeader
        eyebrow="Cash Position"
        title="Live global cash view"
        description="Review balances, projected position shifts, and entities at or near operating thresholds."
      />
      <Card>
        <CardHeader>
          <CardTitle>Entity and bank balances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.positions.length ? (
            snapshot.positions.map((position) => (
              <div
                key={`${position.entity}-${position.bank}`}
                className="grid gap-4 rounded-xl border border-border bg-background/70 p-5 md:grid-cols-[1.2fr_1fr_1fr_auto]"
              >
                <div>
                  <p className="font-semibold">{position.entity}</p>
                  <p className="text-sm text-muted-foreground">{position.bank}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Available</p>
                  <p className="mt-2 text-xl font-semibold">
                    {formatCurrency(position.available, position.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Projected</p>
                  <p className="mt-2 text-xl font-semibold">
                    {formatCurrency(position.projected, position.currency)}
                  </p>
                </div>
                <div className="flex items-center justify-start md:justify-end">
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
              title="No cash balances loaded"
              description="Import bank activity and generate a cash snapshot to populate this view."
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
