/* eslint-disable @typescript-eslint/no-explicit-any */
import { moduleDefinitions, moduleDefinitionsBySlug } from "@/lib/modules/definitions";
import type { ModuleSlug } from "@/lib/modules/validators";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import type { ModuleDetail, ModuleRecord, ModuleSummary } from "@/types/modules";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
type ModuleQueryConfig = {
  table: string;
  select: string;
  orderBy: string;
  mapRecord: (row: Record<string, unknown>) => ModuleRecord;
};

const moduleQueryConfig: Record<ModuleSlug, ModuleQueryConfig> = {
  "identity-access": {
    table: "roles",
    select: "id, name, description, status, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.name),
      status: String(row.status),
      description: String(row.description ?? "Role and permission grouping."),
      meta: [formatDate(row.updated_at), "Role policy"]
    })
  },
  "entity-management": {
    table: "subsidiaries",
    select: "id, name, country_code, status, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.name),
      status: String(row.status),
      description: `Country ${String(row.country_code ?? "N/A")}`,
      meta: [formatDate(row.updated_at), "Entity scope"]
    })
  },
  "bank-connectivity": {
    table: "bank_accounts",
    select: "id, account_name, account_number_masked, currency_code, status, last_balance_at, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.account_name),
      status: String(row.status),
      description: `${String(row.account_number_masked)} · ${String(row.currency_code)}`,
      meta: [formatDate(row.last_balance_at ?? row.updated_at), "Bank account"]
    })
  },
  "statement-processing": {
    table: "bank_statements",
    select: "id, file_name, statement_date, processing_status, closing_balance, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.file_name),
      status: String(row.processing_status),
      description: `Closing balance ${formatCurrency(Number(row.closing_balance ?? 0))}`,
      meta: [formatDate(row.statement_date), "Statement ingestion"]
    })
  },
  reconciliation: {
    table: "reconciliation_runs",
    select: "id, run_date, status, matched_count, exception_count, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: `Run ${formatDate(row.run_date)}`,
      status: String(row.status),
      description: `${row.matched_count} matched, ${row.exception_count} exceptions`,
      meta: [formatDate(row.updated_at), "Reconciliation"]
    })
  },
  "cash-engine": {
    table: "cash_position_snapshots",
    select: "id, snapshot_time, freshness_status, reporting_currency_code, created_at",
    orderBy: "snapshot_time",
    mapRecord: (row) => ({
      id: String(row.id),
      title: `Snapshot ${formatDate(row.snapshot_time)}`,
      status: String(row.freshness_status),
      description: `Reporting currency ${String(row.reporting_currency_code)}`,
      meta: [formatDate(row.created_at), "Cash position"]
    })
  },
  forecasting: {
    table: "forecast_scenarios",
    select: "id, name, scenario_type, status, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.name),
      status: String(row.status),
      description: `Scenario type ${String(row.scenario_type).replaceAll("_", " ")}`,
      meta: [formatDate(row.updated_at), "Forecast scenario"]
    })
  },
  "payments-approvals": {
    table: "payments",
    select: "id, beneficiary_name, amount, currency_code, status, requested_execution_date, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.beneficiary_name),
      status: String(row.status),
      description: formatCurrency(Number(row.amount ?? 0), String(row.currency_code ?? "USD")),
      meta: [formatDate(row.requested_execution_date), "Payment workflow"]
    })
  },
  "liquidity-intercompany": {
    table: "intercompany_loans",
    select: "id, principal_amount, outstanding_amount, currency_code, status, maturity_date, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: `Loan ${formatCurrency(Number(row.principal_amount ?? 0), String(row.currency_code ?? "USD"))}`,
      status: String(row.status),
      description: `Outstanding ${formatCurrency(Number(row.outstanding_amount ?? 0), String(row.currency_code ?? "USD"))}`,
      meta: [formatDate(row.maturity_date), "Inter-company"]
    })
  },
  "risk-hedging": {
    table: "hedging_instruments",
    select: "id, instrument_type, notional_amount, currency_code, status, maturity_date, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.instrument_type).replaceAll("_", " "),
      status: String(row.status),
      description: `Notional ${formatCurrency(Number(row.notional_amount ?? 0), String(row.currency_code ?? "USD"))}`,
      meta: [formatDate(row.maturity_date), "Hedge instrument"]
    })
  },
  investments: {
    table: "investments",
    select: "id, instrument_name, current_value, currency_code, status, maturity_date, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.instrument_name),
      status: String(row.status),
      description: `Current value ${formatCurrency(Number(row.current_value ?? 0), String(row.currency_code ?? "USD"))}`,
      meta: [formatDate(row.maturity_date), "Investment"]
    })
  },
  "debt-covenants": {
    table: "debt_facilities",
    select: "id, lender_name, committed_amount, currency_code, status, maturity_date, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.lender_name),
      status: String(row.status),
      description: `Facility ${formatCurrency(Number(row.committed_amount ?? 0), String(row.currency_code ?? "USD"))}`,
      meta: [formatDate(row.maturity_date), "Debt facility"]
    })
  },
  "policies-orchestration": {
    table: "treasury_policies",
    select: "id, name, policy_type, status, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.name),
      status: String(row.status),
      description: `Policy type ${String(row.policy_type)}`,
      meta: [formatDate(row.updated_at), "Treasury policy"]
    })
  },
  "reporting-audit": {
    table: "compliance_reports",
    select: "id, report_type, status, period_end, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.report_type).replaceAll("_", " "),
      status: String(row.status),
      description: `Period end ${formatDate(row.period_end)}`,
      meta: [formatDate(row.updated_at), "Compliance report"]
    })
  },
  "notifications-mobile": {
    table: "notifications",
    select: "id, title, severity, status, created_at, read_at",
    orderBy: "created_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.title),
      status: String(row.status),
      description: `Severity ${String(row.severity)}`,
      meta: [formatDate(row.read_at ?? row.created_at), "Notification"]
    })
  },
  "dashboards-query": {
    table: "dashboards",
    select: "id, name, is_default, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.name),
      status: row.is_default ? "default" : "active",
      description: row.is_default ? "Default workspace dashboard" : "Custom user dashboard",
      meta: [formatDate(row.updated_at), "Dashboard"]
    })
  },
  "integrations-hub": {
    table: "integration_connections",
    select: "id, provider_name, integration_type, status, last_success_at, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.provider_name),
      status: String(row.status),
      description: `Type ${String(row.integration_type).replaceAll("_", " ")}`,
      meta: [formatDate(row.last_success_at ?? row.updated_at), "Connector"]
    })
  },
  administration: {
    table: "platform_settings",
    select: "id, category, setting_key, status, updated_at",
    orderBy: "updated_at",
    mapRecord: (row) => ({
      id: String(row.id),
      title: String(row.setting_key),
      status: String(row.status),
      description: `Category ${String(row.category)}`,
      meta: [formatDate(row.updated_at), "Platform setting"]
    })
  }
};

export async function getModuleCatalog(): Promise<ModuleSummary[]> {
  const context = await getModuleContext();
  if (!context) {
    return moduleDefinitions.map((definition) => ({
      ...definition,
      recordCount: 0,
      health: "empty",
      recordsLabel: definition.recordsLabel
    }));
  }

  const { supabase, organizationId } = context;

  const counts = await Promise.all(
    moduleDefinitions.map(async (definition) => ({
      slug: definition.slug,
      count: await countByOrganization(supabase, definition.primaryTable, organizationId)
    }))
  );

  const countMap = Object.fromEntries(counts.map((item) => [item.slug, item.count]));

  return moduleDefinitions.map((definition) => {
    const recordCount = countMap[definition.slug] ?? 0;
    return {
      ...definition,
      recordCount,
      recordsLabel: definition.recordsLabel,
      health: recordCount ? "live" : "empty"
    };
  });
}

export async function getModuleDetail(slug: ModuleSlug): Promise<ModuleDetail | null> {
  const definition = moduleDefinitionsBySlug[slug];
  if (!definition) {
    return null;
  }

  const context = await getModuleContext();
  if (!context) {
    return {
      ...definition,
      recordCount: 0,
      recordsLabel: definition.recordsLabel,
      health: "empty",
      metrics: [
        { label: "Records", value: "0" },
        { label: "Active", value: "0" },
        { label: "Latest update", value: "No data" }
      ],
      records: []
    };
  }

  const { supabase, organizationId } = context;
  const config = moduleQueryConfig[slug];
  const { data } = await (supabase as any)
    .from(config.table)
    .select(config.select)
    .eq("organization_id", organizationId)
    .order(config.orderBy, { ascending: false })
    .limit(5);

  const rows = (data ?? []) as Record<string, unknown>[];
  const recordCount = await countByOrganization(supabase, config.table, organizationId);
  const activeCount = rows.filter((row) => String(row.status ?? "").toLowerCase() !== "inactive").length;
  const latestValue = rows[0]
    ? formatDate(
        rows[0].updated_at ??
          rows[0].created_at ??
          rows[0].last_success_at ??
          rows[0].statement_date ??
          rows[0].run_date ??
          rows[0].maturity_date
      )
    : "No data";

  return {
    ...definition,
    recordCount,
    recordsLabel: definition.recordsLabel,
    health: recordCount ? "live" : "empty",
    metrics: [
      { label: "Records", value: String(recordCount) },
      {
        label: "Active",
        value: String(activeCount),
        tone: activeCount ? "positive" : "warning"
      },
      { label: "Latest update", value: latestValue }
    ],
    records: rows.map(config.mapRecord)
  };
}

export async function createModuleRecord(slug: ModuleSlug, payload: Record<string, unknown>) {
  const context = await getModuleContext();
  if (!context) {
    throw new Error("Unauthorized");
  }

  const { supabase, organizationId, userId } = context;
  const defaultSubsidiaryId = await getFirstId(supabase, "subsidiaries", organizationId);
  const secondSubsidiaryId = await getFirstId(supabase, "subsidiaries", organizationId, 1);
  const defaultBankAccountId = await getFirstId(supabase, "bank_accounts", organizationId);
  const defaultCounterpartyId = await getFirstId(supabase, "counterparties", organizationId);
  const defaultForecastId = await getFirstId(supabase, "cash_flow_forecasts", organizationId);
  const defaultExposureId = await getFirstId(supabase, "risk_exposures", organizationId);

  switch (slug) {
    case "identity-access":
      return (supabase as any).from("roles").insert({
        organization_id: organizationId,
        name: payload.name,
        description: payload.description,
        permission_codes_json: ["module.view"]
      });
    case "entity-management":
      return (supabase as any).from("subsidiaries").insert({
        organization_id: organizationId,
        name: payload.name,
        country_code: payload.countryCode,
        base_currency_code: "USD"
      });
    case "bank-connectivity":
      assertDependency(defaultSubsidiaryId, "Create an entity before adding bank connectivity records.");
      return (supabase as any).from("bank_accounts").insert({
        organization_id: organizationId,
        subsidiary_id: defaultSubsidiaryId,
        account_name: payload.accountName,
        account_number_masked: payload.maskedNumber,
        currency_code: payload.currencyCode,
        account_type: "operating"
      });
    case "statement-processing":
      assertDependency(defaultBankAccountId, "Create a bank account before ingesting statements.");
      return (supabase as any).from("bank_statements").insert({
        organization_id: organizationId,
        bank_account_id: defaultBankAccountId,
        statement_date: payload.statementDate,
        file_name: payload.fileName,
        source_type: "mt940",
        processing_status: "queued"
      });
    case "reconciliation":
      assertDependency(defaultBankAccountId, "Create a bank account before running reconciliation.");
      return (supabase as any).from("reconciliation_runs").insert({
        organization_id: organizationId,
        bank_account_id: defaultBankAccountId,
        run_date: payload.runDate,
        matched_count: payload.matchedCount,
        exception_count: payload.exceptionCount,
        status: "completed"
      });
    case "cash-engine":
      return (supabase as any).from("cash_position_snapshots").insert({
        organization_id: organizationId,
        reporting_currency_code: payload.reportingCurrency,
        freshness_status: payload.freshnessStatus
      });
    case "forecasting":
      assertDependency(defaultForecastId, "Create a cash flow forecast baseline before adding scenarios.");
      return (supabase as any).from("forecast_scenarios").insert({
        organization_id: organizationId,
        cash_flow_forecast_id: defaultForecastId,
        name: payload.name,
        scenario_type: payload.scenarioType,
        assumptions_json: { created_from: "module_form" }
      });
    case "payments-approvals":
      assertDependency(defaultSubsidiaryId, "Create an entity before initiating payments.");
      assertDependency(defaultBankAccountId, "Create a bank account before initiating payments.");
      return (supabase as any).from("payments").insert({
        organization_id: organizationId,
        subsidiary_id: defaultSubsidiaryId,
        source_bank_account_id: defaultBankAccountId,
        beneficiary_name: payload.beneficiaryName,
        amount: payload.amount,
        currency_code: payload.currencyCode,
        requested_execution_date: currentDateOffset(2),
        payment_type: "domestic",
        status: "draft",
        created_by: userId
      });
    case "liquidity-intercompany":
      assertDependency(defaultSubsidiaryId, "Create at least one entity before recording inter-company liquidity.");
      return (supabase as any).from("intercompany_loans").insert({
        organization_id: organizationId,
        lender_subsidiary_id: defaultSubsidiaryId,
        borrower_subsidiary_id: secondSubsidiaryId ?? defaultSubsidiaryId,
        principal_amount: payload.principalAmount,
        outstanding_amount: payload.principalAmount,
        currency_code: payload.currencyCode,
        interest_rate: payload.interestRate,
        maturity_date: currentDateOffset(90)
      });
    case "risk-hedging":
      assertDependency(defaultExposureId, "Create a risk exposure before managing hedging instruments.");
      assertDependency(defaultCounterpartyId, "Create a counterparty before managing hedging instruments.");
      return (supabase as any).from("hedging_instruments").insert({
        organization_id: organizationId,
        exposure_id: defaultExposureId,
        counterparty_id: defaultCounterpartyId,
        instrument_type: payload.instrumentType,
        notional_amount: payload.notionalAmount,
        currency_code: payload.currencyCode,
        mtm_amount: 0,
        maturity_date: currentDateOffset(60)
      });
    case "investments":
      assertDependency(defaultCounterpartyId, "Create a counterparty before recording investments.");
      return (supabase as any).from("investments").insert({
        organization_id: organizationId,
        counterparty_id: defaultCounterpartyId,
        investment_type: "money_market",
        instrument_name: payload.instrumentName,
        principal_amount: payload.principalAmount,
        current_value: payload.principalAmount,
        currency_code: payload.currencyCode,
        maturity_date: currentDateOffset(30),
        status: "active"
      });
    case "debt-covenants":
      return (supabase as any).from("debt_facilities").insert({
        organization_id: organizationId,
        lender_name: payload.lenderName,
        facility_type: "revolver",
        currency_code: payload.currencyCode,
        committed_amount: payload.committedAmount,
        drawn_amount: 0,
        maturity_date: currentDateOffset(365),
        status: "active"
      });
    case "policies-orchestration":
      return (supabase as any).from("treasury_policies").insert({
        organization_id: organizationId,
        name: payload.name,
        policy_type: payload.policyType,
        policy_json: { created_from: "module_form" },
        version: 1,
        status: "draft"
      });
    case "reporting-audit":
      return (supabase as any).from("compliance_reports").insert({
        organization_id: organizationId,
        report_type: payload.reportType,
        period_start: payload.periodStart,
        period_end: payload.periodEnd,
        status: "pending",
        created_by_user_id: userId
      });
    case "notifications-mobile":
      return (supabase as any).from("notifications").insert({
        organization_id: organizationId,
        user_id: userId,
        channel: "in_app",
        notification_type: "manual",
        severity: payload.severity,
        title: payload.title,
        body: payload.body,
        status: "queued"
      });
    case "dashboards-query": {
      const { data, error } = await (supabase as any)
        .from("dashboards")
        .insert({
          organization_id: organizationId,
          user_id: userId,
          name: payload.name,
          layout_json: { created_from: "module_form" }
        })
        .select("id")
        .single();

      if (error) {
        return { error };
      }

      return (supabase as any).from("dashboard_widgets").insert({
        dashboard_id: data.id,
        widget_type: payload.widgetType,
        title: `${payload.name} starter widget`,
        config_json: { mode: "starter" }
      });
    }
    case "integrations-hub":
      return (supabase as any).from("integration_connections").insert({
        organization_id: organizationId,
        provider_name: payload.providerName,
        integration_type: payload.integrationType,
        status: "pending",
        config_json: { created_from: "module_form" }
      });
    case "administration":
      return (supabase as any).from("platform_settings").insert({
        organization_id: organizationId,
        category: payload.category,
        setting_key: payload.settingKey,
        setting_value_json: { value: payload.settingValue },
        status: "active"
      });
  }
}

function assertDependency(value: string | null, message: string) {
  if (!value) {
    throw new Error(message);
  }
}

async function getModuleContext() {
  const [session, supabase] = await Promise.all([getAppSession(), createSupabaseServerClient()]);
  if (!session || !supabase || session.organization.id === "unassigned") {
    return null;
  }

  return {
    session,
    supabase: supabase as SupabaseClient,
    organizationId: session.organization.id,
    userId: session.user.id
  };
}

async function countByOrganization(supabase: SupabaseClient, table: string, organizationId: string) {
  const { count } = await (supabase as any)
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  return count ?? 0;
}

async function getFirstId(
  supabase: SupabaseClient,
  table: string,
  organizationId: string,
  offset = 0
) {
  const { data } = await (supabase as any)
    .from(table)
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })
    .range(offset, offset);

  return data?.[0]?.id ?? null;
}

function formatDate(value: unknown) {
  if (!value) {
    return "No date";
  }

  return new Date(String(value)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function currentDateOffset(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
