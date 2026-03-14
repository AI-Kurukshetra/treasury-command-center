import { CashTrendChart } from "@/components/charts/cash-trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { ActionCard } from "@/components/operations/action-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getForecastsPayload } from "@/lib/domain/treasury-api";

type ForecastRecord = {
  id: string;
  name: string;
  horizon_type: string;
  methodology: string;
  reporting_currency_code: string;
  status: string;
  accuracy_score: number | null;
};

type ScenarioRecord = {
  id: string;
  name: string;
  scenario_type: string;
  status: string;
};

type ForecastLineRecord = {
  id: string;
  forecast_date: string;
  net_amount: number;
  reporting_amount: number;
};

export default async function ForecastsPage() {
  const forecastPayload = await getForecastsPayload();
  const forecasts = forecastPayload.forecasts as ForecastRecord[];
  const scenarios = forecastPayload.scenarios as ScenarioRecord[];
  const latestLines = forecastPayload.latestLines as ForecastLineRecord[];
  const chartData = latestLines.map((line, index) => ({
    week: `W${index + 1}`,
    actual: Number(line.reporting_amount ?? 0),
    forecast: Number(line.net_amount ?? 0)
  }));
  const latestVariance =
    chartData[chartData.length - 1]
      ? chartData[chartData.length - 1].actual - chartData[chartData.length - 1].forecast
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
            {chartData.length ? (
              <CashTrendChart data={chartData} />
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Forecast inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {forecasts.length ? (
              forecasts.map((forecast) => (
                <div
                  key={forecast.id}
                  className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{forecast.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {forecast.horizon_type} · {forecast.methodology} · {forecast.reporting_currency_code}
                      </p>
                    </div>
                    <Badge variant={forecast.status === "published" ? "success" : "secondary"}>
                      {forecast.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Accuracy score: {forecast.accuracy_score ?? "Pending"}
                  </p>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No forecasts published"
                description="Generate the first short-term or long-term forecast to start the planning cycle."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scenario register</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scenarios.length ? (
              scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{scenario.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{scenario.scenario_type}</p>
                    </div>
                    <Badge variant={scenario.status === "published" ? "success" : "secondary"}>
                      {scenario.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No scenarios created"
                description="Scenario-mode forecast generation will register named cases here."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ActionCard
          title="Generate forecast"
          description="Publish a new short-term or long-term forecast based on current transactions and scheduled payments."
          endpoint="/api/forecasts"
          submitLabel="Generate forecast"
          fields={[
            { name: "name", label: "Forecast name", placeholder: "Weekly liquidity outlook" },
            {
              name: "horizonType",
              label: "Horizon",
              type: "select",
              options: [
                { label: "Short term", value: "short_term" },
                { label: "Long term", value: "long_term" }
              ]
            },
            {
              name: "methodology",
              label: "Methodology",
              type: "select",
              options: [
                { label: "Historical", value: "historical" },
                { label: "Rules", value: "rules" },
                { label: "Scenario", value: "scenario" }
              ]
            },
            {
              name: "reportingCurrencyCode",
              label: "Reporting currency",
              type: "select",
              options: [
                { label: "USD", value: "USD" },
                { label: "EUR", value: "EUR" }
              ]
            },
            { name: "weeks", label: "Weeks", type: "number", defaultValue: "6" },
            { name: "scenarioName", label: "Scenario name", placeholder: "Base release case" }
          ]}
        />
      </section>
    </>
  );
}
