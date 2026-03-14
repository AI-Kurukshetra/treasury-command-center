import { CashTrendChart } from "@/components/charts/cash-trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";

export default async function ForecastsPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <>
      <PageHeader
        eyebrow="Forecasting"
        title="Cash flow forecasting"
        description="Track short-term liquidity movement, compare forecast accuracy, and inspect directional changes before release windows."
      />
      <Card>
        <CardHeader>
          <CardTitle>Forecast trend</CardTitle>
          <CardDescription>Baseline projection versus realized cash movement.</CardDescription>
        </CardHeader>
        <CardContent>
          {snapshot.forecasts.length ? (
            <CashTrendChart data={snapshot.forecasts} />
          ) : (
            <SectionEmpty
              title="No forecast series available"
              description="Create a forecast header and forecast line items to visualize projected cash movement."
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
