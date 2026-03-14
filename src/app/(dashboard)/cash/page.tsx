import { ActionCard } from "@/components/operations/action-card";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionEmpty } from "@/components/ui/section-empty";
import { getDashboardSnapshot } from "@/lib/domain/treasury";
import {
  getAccountsPayload,
  getCashPositionsPayload,
  getTransactionsPayload
} from "@/lib/domain/treasury-api";
import { formatCurrency } from "@/lib/utils";

type BankAccountRecord = {
  id: string;
  account_name: string;
  currency_code: string;
  account_type: string;
  status: string;
  updated_at: string;
};

type BankRelationshipRecord = {
  id: string;
  bank_name: string;
  region: string | null;
  status: string;
};

type StatementRecord = {
  id: string;
  file_name: string;
  statement_date: string;
  source_type: string;
  processing_status: string;
};

type ReconciliationRecord = {
  id: string;
  run_date: string;
  status: string;
  matched_count: number;
  exception_count: number;
};

type SnapshotRecord = {
  id: string;
  snapshot_time: string;
  reporting_currency_code: string;
  freshness_status: string;
};

export default async function CashPage() {
  const [snapshot, accountsPayload, transactionsPayload, cashPositionsPayload] = await Promise.all([
    getDashboardSnapshot(),
    getAccountsPayload(),
    getTransactionsPayload(),
    getCashPositionsPayload()
  ]);
  const criticalEntities = snapshot.positions.filter((item) => item.status !== "healthy");
  const totalAvailable = snapshot.positions.reduce((sum, item) => sum + item.available, 0);
  const bankAccounts = accountsPayload.accounts as BankAccountRecord[];
  const bankRelationships = accountsPayload.bankRelationships as BankRelationshipRecord[];
  const statements = transactionsPayload.statements as StatementRecord[];
  const reconciliationRuns = transactionsPayload.reconciliationRuns as ReconciliationRecord[];
  const snapshots = cashPositionsPayload.snapshots as SnapshotRecord[];

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

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Bank connectivity and accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bankRelationships.length || bankAccounts.length ? (
              <>
                {bankRelationships.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{relationship.bank_name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {relationship.region || "Global coverage"}
                        </p>
                      </div>
                      <Badge variant="secondary">{relationship.status}</Badge>
                    </div>
                  </div>
                ))}
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{account.account_name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {account.account_type} · {account.currency_code}
                        </p>
                      </div>
                      <Badge variant={account.status === "active" ? "success" : "secondary"}>
                        {account.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <SectionEmpty
                title="No bank connectivity configured"
                description="Register a bank relationship and operating account before importing statements."
              />
            )}
          </CardContent>
        </Card>

        <Card className="dark-panel border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-white">Statement and reconciliation rail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statements.length ? (
              statements.slice(0, 4).map((statement) => (
                <div key={statement.id} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{statement.file_name}</p>
                      <p className="mt-1 text-sm text-white/70">
                        {statement.source_type} · {statement.statement_date}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/15 bg-white/10 text-white/80"
                    >
                      {statement.processing_status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No statement imports"
                description="MT940, OCR, and API-based statement imports will accumulate here."
              />
            )}

            {reconciliationRuns.length ? (
              reconciliationRuns.slice(0, 3).map((run) => (
                <div key={run.id} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">Run {run.id.slice(0, 8)}</p>
                      <p className="mt-1 text-sm text-white/70">
                        {run.run_date} · matched {run.matched_count} · exceptions {run.exception_count}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/15 bg-white/10 text-white/80"
                    >
                      {run.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Cash snapshot history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshots.length ? (
              snapshots.map((cashSnapshot) => (
                <div
                  key={cashSnapshot.id}
                  className="rounded-[1.35rem] border border-border/70 bg-white/68 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{cashSnapshot.snapshot_time.slice(0, 10)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Reporting currency {cashSnapshot.reporting_currency_code}
                      </p>
                    </div>
                    <Badge
                      variant={
                        cashSnapshot.freshness_status === "fresh"
                          ? "success"
                          : cashSnapshot.freshness_status === "stale"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {cashSnapshot.freshness_status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <SectionEmpty
                title="No cash snapshots generated"
                description="Generate a snapshot after importing transactions or bank statements."
              />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <ActionCard
            title="Register bank relationship"
            description="Create a treasury bank relationship for new connectivity or account onboarding."
            endpoint="/api/accounts"
            submitLabel="Create relationship"
            payloadDefaults={{ recordType: "bank_relationship" }}
            fields={[
              { name: "bankName", label: "Bank name", placeholder: "JPMorgan Chase" },
              { name: "bankCode", label: "Bank code", placeholder: "JPMC" },
              { name: "region", label: "Region", placeholder: "North America" }
            ]}
          />
          <ActionCard
            title="Register bank account"
            description="Create an account record used by statements, transactions, and snapshots."
            endpoint="/api/accounts"
            submitLabel="Create account"
            payloadDefaults={{ recordType: "bank_account" }}
            fields={[
              { name: "accountName", label: "Account name", placeholder: "US operating account" },
              { name: "maskedNumber", label: "Masked number", placeholder: "****4821" },
              {
                name: "currencyCode",
                label: "Currency",
                type: "select",
                options: [
                  { label: "USD", value: "USD" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" }
                ]
              }
            ]}
          />
          <ActionCard
            title="Import statement"
            description="Queue a statement import for OCR, MT940, or API-driven statement processing."
            endpoint="/api/transactions"
            submitLabel="Queue import"
            payloadDefaults={{ recordType: "statement_import" }}
            fields={[
              { name: "fileName", label: "File name", placeholder: "march-ops.mt940" },
              { name: "statementDate", label: "Statement date", type: "date" },
              {
                name: "sourceType",
                label: "Source type",
                type: "select",
                options: [
                  { label: "MT940", value: "mt940" },
                  { label: "OCR", value: "ocr" },
                  { label: "API", value: "api" }
                ]
              }
            ]}
          />
          <ActionCard
            title="Run reconciliation"
            description="Compare booked transactions against imported statement activity and record exceptions."
            endpoint="/api/transactions"
            submitLabel="Run reconciliation"
            payloadDefaults={{ recordType: "reconciliation" }}
            fields={[{ name: "runDate", label: "Run date", type: "date" }]}
          />
          <ActionCard
            title="Generate cash snapshot"
            description="Build a tenant-wide cash position snapshot in reporting currency."
            endpoint="/api/cash-positions"
            submitLabel="Generate snapshot"
            fields={[
              {
                name: "reportingCurrencyCode",
                label: "Reporting currency",
                type: "select",
                options: [
                  { label: "USD", value: "USD" },
                  { label: "EUR", value: "EUR" },
                  { label: "GBP", value: "GBP" }
                ],
                defaultValue: "USD"
              },
              {
                name: "freshnessStatus",
                label: "Freshness",
                type: "select",
                options: [
                  { label: "Fresh", value: "fresh" },
                  { label: "Partial", value: "partial" },
                  { label: "Stale", value: "stale" }
                ],
                defaultValue: "fresh"
              }
            ]}
          />
        </div>
      </section>
    </>
  );
}
