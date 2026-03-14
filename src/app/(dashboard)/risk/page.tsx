import { ActionCard } from "@/components/operations/action-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import { getRiskPayload } from "@/lib/domain/treasury-api";
import { formatCurrency } from "@/lib/utils";

type ExposureRecord = {
  id: string;
  exposure_currency_code: string | null;
  gross_amount: number;
  net_amount: number | null;
  reference_entity_type: string;
  measured_at: string;
};

type HedgeRecord = {
  id: string;
  instrument_type: string;
  currency_code: string;
  notional_amount: number;
  mtm_amount: number;
  maturity_date: string | null;
  status: string;
};

type MarketDataRecord = {
  id: string;
  provider_name: string;
  instrument_type: string;
  symbol: string;
  value_numeric: number;
  observed_at: string;
};

export default async function RiskPage() {
  const [snapshot, riskPayload] = await Promise.all([getDashboardSnapshot(), getRiskPayload()]);
  const exposures = riskPayload.exposures as ExposureRecord[];
  const hedges = riskPayload.hedges as HedgeRecord[];
  const marketData = riskPayload.marketData as MarketDataRecord[];

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
            {exposures.length ? (
              exposures.map((exposure) => (
                <div
                  key={exposure.id}
                  className="rounded-[1.5rem] border border-border/70 bg-white/68 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Currency</p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        {exposure.exposure_currency_code ?? "N/A"}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reference {exposure.reference_entity_type}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Gross</p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(exposure.gross_amount, exposure.exposure_currency_code ?? "USD")}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Measured</p>
                      <p className="mt-2 font-semibold">{exposure.measured_at.slice(0, 10)}</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open</p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(
                          Number(exposure.net_amount ?? exposure.gross_amount),
                          exposure.exposure_currency_code ?? "USD"
                        )}
                      </p>
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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Hedge book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hedges.length ? (
              hedges.map((hedge) => (
                <div key={hedge.id} className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{hedge.instrument_type}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {hedge.currency_code} · maturity {hedge.maturity_date ?? "open"}
                      </p>
                    </div>
                    <Badge variant={hedge.status === "active" ? "success" : "secondary"}>
                      {hedge.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notional</p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(hedge.notional_amount, hedge.currency_code)}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-background/80 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">MTM</p>
                      <p className="mt-2 font-semibold">
                        {formatCurrency(hedge.mtm_amount, hedge.currency_code)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No hedging instruments"
                description="Add forwards, swaps, or options to monitor hedge posture here."
              />
            )}
          </CardContent>
        </Card>

        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Market data feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketData.length ? (
              marketData.map((point) => (
                <div key={point.id} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{point.symbol}</p>
                      <p className="mt-1 text-sm text-white/70">
                        {point.provider_name} · {point.instrument_type}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white/90">{point.value_numeric}</p>
                  </div>
                  <p className="mt-3 text-sm text-white/65">{point.observed_at.slice(0, 19)}</p>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No market data points"
                description="Publish FX or rate observations to support hedging and exposure decisions."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <ActionCard
          title="Measure exposure"
          description="Capture a fresh exposure measurement tied to a treasury entity or workflow."
          endpoint="/api/risk"
          submitLabel="Create exposure"
          payloadDefaults={{ recordType: "exposure", referenceEntityType: "payment" }}
          fields={[
            {
              name: "exposureType",
              label: "Exposure type",
              type: "select",
              options: [
                { label: "FX", value: "fx" },
                { label: "Interest rate", value: "interest_rate" },
                { label: "Credit", value: "credit" }
              ]
            },
            {
              name: "exposureCurrencyCode",
              label: "Currency",
              type: "select",
              options: [
                { label: "USD", value: "USD" },
                { label: "EUR", value: "EUR" },
                { label: "GBP", value: "GBP" }
              ]
            },
            { name: "grossAmount", label: "Gross amount", type: "number", placeholder: "250000" },
            { name: "netAmount", label: "Net amount", type: "number", placeholder: "175000" }
          ]}
        />
        <ActionCard
          title="Book hedge"
          description="Add a hedge instrument used to offset a visible exposure."
          endpoint="/api/risk"
          submitLabel="Create hedge"
          payloadDefaults={{ recordType: "hedge" }}
          fields={[
            {
              name: "instrumentType",
              label: "Instrument type",
              type: "select",
              options: [
                { label: "FX forward", value: "fx_forward" },
                { label: "Option", value: "option" },
                { label: "Swap", value: "swap" }
              ]
            },
            {
              name: "currencyCode",
              label: "Currency",
              type: "select",
              options: [
                { label: "USD", value: "USD" },
                { label: "EUR", value: "EUR" },
                { label: "GBP", value: "GBP" }
              ]
            },
            { name: "notionalAmount", label: "Notional amount", type: "number", placeholder: "200000" },
            { name: "mtmAmount", label: "Mark to market", type: "number", defaultValue: "0" },
            { name: "maturityDate", label: "Maturity date", type: "date" }
          ]}
        />
        <ActionCard
          title="Publish market data"
          description="Store a market observation for use in analytics, hedging, and exposure tracking."
          endpoint="/api/risk"
          submitLabel="Publish data point"
          payloadDefaults={{ recordType: "market_data" }}
          fields={[
            { name: "providerName", label: "Provider", placeholder: "Reuters" },
            { name: "instrumentType", label: "Instrument type", placeholder: "fx_spot" },
            { name: "symbol", label: "Symbol", placeholder: "USD/EUR" },
            { name: "valueNumeric", label: "Value", type: "number", placeholder: "0.92" }
          ]}
        />
      </section>
    </>
  );
}
