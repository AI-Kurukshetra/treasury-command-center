import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";

export default async function IntegrationsPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <>
      <PageHeader
        eyebrow="Integrations"
        title="Connector health"
        description="Track banks, ERP syncs, and data-ingestion services with one operational view."
      />
      <Card>
        <CardHeader>
          <CardTitle>Active connections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.integrations.length ? (
            snapshot.integrations.map((integration) => (
              <div
                key={integration.provider}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background/70 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold">{integration.provider}</p>
                  <p className="text-sm text-muted-foreground">
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
    </>
  );
}
