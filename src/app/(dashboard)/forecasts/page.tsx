import { CashTrendChart } from "@/components/charts/cash-trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";

export default async function ForecastsPage() {
  const snapshot = await getDashboardSnapshot();
  const latestVariance =
    snapshot.forecasts[snapshot.forecasts.length - 1]
      ? snapshot.forecasts[snapshot.forecasts.length - 1].actual -
        snapshot.forecasts[snapshot.forecasts.length - 1].forecast
      : 0;

  return (
    <>
      <PageHeader
        eyebrow="Forecasting"
        title="Cash flow forecasting"
        description="Track short-term liquidity movement, compare forecast accuracy, and inspect directional changes before release windows."
        meta={["13-week view", "Variance watch", "Scenario-ready"]}
      />
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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

        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Forecast command notes</CardTitle>
            <CardDescription className="text-white/70">
              Short tactical signal for treasury planning and release preparation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Latest visible variance</p>
              <p className="mt-3 font-display text-4xl font-semibold">
                {latestVariance >= 0 ? "+" : ""}
                {latestVariance}
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
              <p className="font-display text-xl font-semibold">Planning posture</p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Use this surface to compare realized movement against planning assumptions before
                funding and approval decisions are made.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
