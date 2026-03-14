import { ActionCard } from "@/components/operations/action-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";

export default async function IntegrationsPage() {
  const snapshot = await getDashboardSnapshot();
  const errorCount = snapshot.integrations.filter((integration) => integration.status === "error").length;

  return (
    <>
      <PageHeader
        eyebrow="Integrations"
        title="Connector health"
        description="Track banks, ERP syncs, and data-ingestion services with one operational view."
        meta={["Banks", "ERP sync", "Data pipelines"]}
      />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Health summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Connections tracked</p>
              <p className="mt-3 font-display text-4xl font-semibold">{snapshot.integrations.length}</p>
            </div>
            <div className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Errors visible</p>
              <p className="mt-3 font-display text-4xl font-semibold">{errorCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.integrations.length ? (
              snapshot.integrations.map((integration) => (
                <div
                  key={integration.provider}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-white/68 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-display text-xl font-semibold">{integration.provider}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {integration.type} · Last sync {integration.lastSync}
                    </p>
                  </div>
                  <Badge
                    variant={
                      integration.status === "healthy"
                        ? "success"
                        : integration.status === "error"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {integration.status}
                  </Badge>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No active integrations"
                description="Connect a bank, ERP, or data source to monitor sync health and connector status here."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ActionCard
          title="Register connector"
          description="Create a bank, ERP, market-data, OCR, or signature connector record in the integrations hub."
          endpoint="/api/integrations"
          submitLabel="Create connector"
          payloadDefaults={{ recordType: "connection" }}
          fields={[
            {
              name: "integrationType",
              label: "Integration type",
              type: "select",
              options: [
                { label: "Bank", value: "bank" },
                { label: "ERP", value: "erp" },
                { label: "Market data", value: "market_data" },
                { label: "OCR", value: "ocr" },
                { label: "Signature", value: "signature" }
              ]
            },
            { name: "providerName", label: "Provider name", placeholder: "SAP S/4HANA" },
            {
              name: "credentialsReference",
              label: "Credentials reference",
              placeholder: "vault://sap-prod"
            }
          ]}
        />
      </section>
    </>
  );
}
