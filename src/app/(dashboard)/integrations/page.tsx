import { ActionCard } from "@/components/operations/action-card";
import { IntegrationSyncButton } from "@/components/operations/integration-sync-button";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getIntegrationsPayload } from "@/lib/domain/treasury-api";

type IntegrationRecord = {
  id: string;
  integration_type: string;
  provider_name: string;
  status: string;
  last_success_at: string | null;
};

type SyncRunRecord = {
  id: string;
  sync_type: string;
  status: string;
  records_processed: number;
};

export default async function IntegrationsPage() {
  const integrationsData = await getIntegrationsPayload();
  const connections = integrationsData.connections as IntegrationRecord[];
  const syncRuns = integrationsData.syncRuns as SyncRunRecord[];
  const errorCount = connections.filter((integration) => integration.status === "error").length;

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
              <p className="mt-3 font-display text-4xl font-semibold">{connections.length}</p>
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
            {connections.length ? (
              connections.map((integration) => (
                <div
                  key={String(integration.id)}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-white/68 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-display text-xl font-semibold">{String(integration.provider_name)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {String(integration.integration_type).replaceAll("_", " ")} · Last sync{" "}
                      {integration.last_success_at
                        ? new Date(String(integration.last_success_at)).toLocaleString()
                        : "Never"}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">ID: {String(integration.id)}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <Badge
                      variant={
                        integration.status === "active"
                          ? "success"
                          : integration.status === "error"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {String(integration.status)}
                    </Badge>
                    <IntegrationSyncButton
                      connectionId={String(integration.id)}
                      providerName={String(integration.provider_name)}
                      syncType={`${String(integration.integration_type)}_sync`}
                    />
                  </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Recent sync runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncRuns.length ? (
              syncRuns.slice(0, 6).map((run) => (
                <div
                  key={String(run.id)}
                  className="rounded-[1.4rem] border border-border/70 bg-white/68 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-semibold">{String(run.sync_type)}</p>
                    <Badge
                      variant={
                        run.status === "succeeded"
                          ? "success"
                          : run.status === "failed"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {String(run.status)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Records processed: {String(run.records_processed ?? 0)}
                  </p>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No sync runs yet"
                description="Run a connector sync to populate operational history in the integrations hub."
              />
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
