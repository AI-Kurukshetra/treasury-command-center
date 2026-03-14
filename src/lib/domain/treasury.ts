import { primaryNavigation } from "@/data/demo-data";
import { getAppSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type {
  AlertItem,
  CashPosition,
  DashboardSnapshot,
  ExposureItem,
  ForecastPoint,
  IntegrationItem,
  NavItem,
  PaymentItem,
  ReportItem
} from "@/types/treasury";

type SnapshotHeader = Pick<
  Database["public"]["Tables"]["cash_position_snapshots"]["Row"],
  "id" | "snapshot_time" | "reporting_currency_code" | "freshness_status"
>;
type ForecastHeader = Pick<
  Database["public"]["Tables"]["cash_flow_forecasts"]["Row"],
  "id" | "reporting_currency_code" | "accuracy_score"
>;
type CashLineRow = Pick<
  Database["public"]["Tables"]["cash_position_lines"]["Row"],
  "bank_account_id" | "subsidiary_id" | "currency_code" | "balance_amount" | "reporting_amount"
>;
type ForecastLineRow = Pick<
  Database["public"]["Tables"]["forecast_lines"]["Row"],
  "forecast_date" | "net_amount" | "reporting_amount"
>;
type PaymentRow = Pick<
  Database["public"]["Tables"]["payments"]["Row"],
  "id" | "beneficiary_name" | "amount" | "currency_code" | "requested_execution_date" | "status"
>;
type NotificationRow = Pick<
  Database["public"]["Tables"]["notifications"]["Row"],
  "id" | "title" | "severity" | "body"
>;
type ExposureRow = Pick<
  Database["public"]["Tables"]["risk_exposures"]["Row"],
  "exposure_currency_code" | "gross_amount" | "net_amount"
>;
type ReportRow = Pick<
  Database["public"]["Tables"]["compliance_reports"]["Row"],
  "id" | "report_type" | "created_at" | "status"
>;
type IntegrationRow = Pick<
  Database["public"]["Tables"]["integration_connections"]["Row"],
  "provider_name" | "integration_type" | "status" | "last_success_at"
>;

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  stats: [
    { label: "Global cash", value: 0, change: 0, format: "currency" },
    { label: "Available liquidity", value: 0, change: 0, format: "currency" },
    { label: "Open exposure", value: 0, change: 0, format: "currency" },
    { label: "Payments queued", value: 0, change: 0, format: "number" }
  ],
  positions: [],
  forecasts: [],
  payments: [],
  alerts: [],
  exposures: [],
  reports: [],
  integrations: []
};

export async function getNavigation(): Promise<NavItem[]> {
  return primaryNavigation;
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const session = await getAppSession();
  const supabase = await createSupabaseServerClient();

  if (!session || !supabase || session.organization.id === "unassigned") {
    return EMPTY_SNAPSHOT;
  }

  const organizationId = session.organization.id;

  const [
    latestSnapshotResult,
    latestForecastResult,
    paymentsResult,
    queuedPaymentsCountResult,
    notificationsResult,
    exposuresResult,
    reportsResult,
    integrationsResult
  ] = await Promise.all([
    supabase
      .from("cash_position_snapshots")
      .select("id, snapshot_time, reporting_currency_code, freshness_status")
      .eq("organization_id", organizationId)
      .order("snapshot_time", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("cash_flow_forecasts")
      .select("id, reporting_currency_code, accuracy_score")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("payments")
      .select("id, beneficiary_name, amount, currency_code, requested_execution_date, status")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("status", ["draft", "submitted", "approved"]),
    supabase
      .from("notifications")
      .select("id, title, severity, body")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("risk_exposures")
      .select("exposure_currency_code, gross_amount, net_amount")
      .eq("organization_id", organizationId)
      .order("measured_at", { ascending: false })
      .limit(5),
    supabase
      .from("compliance_reports")
      .select("id, report_type, created_at, status")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("integration_connections")
      .select("provider_name, integration_type, status, last_success_at")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(5)
  ]);
  const latestSnapshot = latestSnapshotResult.data as SnapshotHeader | null;
  const latestForecast = latestForecastResult.data as ForecastHeader | null;
  const paymentRows = (paymentsResult.data ?? []) as PaymentRow[];
  const notificationRows = (notificationsResult.data ?? []) as NotificationRow[];
  const exposureRows = (exposuresResult.data ?? []) as ExposureRow[];
  const reportRows = (reportsResult.data ?? []) as ReportRow[];
  const integrationRows = (integrationsResult.data ?? []) as IntegrationRow[];

  const cashLines = latestSnapshot
    ? (
        await supabase
          .from("cash_position_lines")
          .select("bank_account_id, subsidiary_id, currency_code, balance_amount, reporting_amount")
          .eq("cash_position_snapshot_id", latestSnapshot.id)
      ).data ?? []
    : [];
  const cashLineRows = cashLines as CashLineRow[];

  const forecastLines = latestForecast
    ? (
        await supabase
          .from("forecast_lines")
          .select("forecast_date, net_amount, reporting_amount")
          .eq("cash_flow_forecast_id", latestForecast.id)
          .order("forecast_date", { ascending: true })
          .limit(6)
      ).data ?? []
    : [];
  const forecastLineRows = forecastLines as ForecastLineRow[];

  const positions = buildPositions(cashLineRows);
  const forecasts = buildForecastSeries(forecastLineRows);
  const payments = buildPayments(paymentRows);
  const alerts = buildAlerts(notificationRows);
  const exposures = buildExposures(exposureRows);
  const reports = buildReports(reportRows);
  const integrations = buildIntegrations(integrationRows);

  const totalCash = positions.reduce((sum, item) => sum + item.available, 0);
  const availableLiquidity = positions
    .filter((item) => item.status !== "critical")
    .reduce((sum, item) => sum + item.projected, 0);
  const openExposure = exposures.reduce((sum, item) => sum + item.open, 0);
  const paymentsQueued = queuedPaymentsCountResult.count ?? payments.length;
  const forecastAccuracy = latestForecast?.accuracy_score ?? 0;
  const staleAlertCount = alerts.filter((item) => item.severity !== "info").length;

  return {
    stats: [
      { label: "Global cash", value: totalCash, change: forecastAccuracy / 20, format: "currency" },
      {
        label: "Available liquidity",
        value: availableLiquidity,
        change: latestSnapshot?.freshness_status === "fresh" ? 1.2 : -1.2,
        format: "currency"
      },
      {
        label: "Open exposure",
        value: openExposure,
        change: staleAlertCount ? -Number(staleAlertCount) : 0.8,
        format: "currency"
      },
      { label: "Payments queued", value: paymentsQueued, change: paymentsQueued ? 2.4 : 0, format: "number" }
    ],
    positions,
    forecasts,
    payments,
    alerts,
    exposures,
    reports,
    integrations
  };
}

function buildPositions(
  lines: CashLineRow[]
): CashPosition[] {
  return lines.slice(0, 6).map((line, index) => ({
    entity: line.subsidiary_id ? `Entity ${line.subsidiary_id.slice(0, 8)}` : `Entity ${index + 1}`,
    bank: line.bank_account_id ? `Account ${line.bank_account_id.slice(0, 8)}` : "Unmapped account",
    currency: line.currency_code,
    available: Number(line.balance_amount ?? 0),
    projected: Number(line.reporting_amount ?? 0),
    status:
      Number(line.reporting_amount ?? 0) <= 0
        ? "critical"
        : Number(line.reporting_amount ?? 0) < Number(line.balance_amount ?? 0) * 0.85
          ? "watch"
          : "healthy"
  }));
}

function buildForecastSeries(
  lines: ForecastLineRow[]
): ForecastPoint[] {
  return lines.map((line, index) => ({
    week: `W${index + 1}`,
    actual: Number(line.reporting_amount ?? 0),
    forecast: Number(line.net_amount ?? 0)
  }));
}

function buildPayments(rows: PaymentRow[]): PaymentItem[] {
  return rows.map((payment) => ({
    id: payment.id,
    beneficiary: payment.beneficiary_name,
    amount: Number(payment.amount ?? 0),
    currency: payment.currency_code,
    dueDate: payment.requested_execution_date,
    status: normalizePaymentStatus(payment.status),
    approvalsRemaining: payment.status === "approved" ? 0 : payment.status === "submitted" ? 1 : 2
  }));
}

function buildAlerts(rows: NotificationRow[]): AlertItem[] {
  return rows.map((notification) => ({
    id: notification.id,
    title: notification.title,
    severity: normalizeAlertSeverity(notification.severity),
    detail: notification.body,
    action: "Review item"
  }));
}

function buildExposures(rows: ExposureRow[]): ExposureItem[] {
  return rows.map((exposure, index) => {
    const gross = Number(exposure.gross_amount ?? 0);
    const open = Number(exposure.net_amount ?? gross);
    const hedged = gross - open;

    return {
      currency: exposure.exposure_currency_code ?? `FX-${index + 1}`,
      gross,
      hedged,
      open
    };
  });
}

function buildReports(rows: ReportRow[]): ReportItem[] {
  return rows.map((report) => ({
    id: report.id,
    title: `${capitalize(report.report_type)} report`,
    type: capitalize(report.report_type),
    generatedAt: new Date(report.created_at).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }),
    status: report.status === "generated" || report.status === "delivered" ? "ready" : "queued"
  }));
}

function buildIntegrations(rows: IntegrationRow[]): IntegrationItem[] {
  return rows.map((integration) => ({
    provider: integration.provider_name,
    type: capitalize(integration.integration_type),
    status: normalizeIntegrationStatus(integration.status),
    lastSync: integration.last_success_at
      ? new Date(integration.last_success_at).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short"
        })
      : "Never"
  }));
}

function normalizePaymentStatus(
  status?: string
): "draft" | "submitted" | "approved" | "released" | "at-risk" {
  switch (status) {
    case "draft":
    case "submitted":
    case "approved":
    case "released":
      return status;
    default:
      return "at-risk";
  }
}

function normalizeAlertSeverity(
  severity?: string
): "info" | "warning" | "critical" {
  if (severity === "warning" || severity === "critical") {
    return severity;
  }

  return "info";
}

function normalizeIntegrationStatus(
  status: string
): "healthy" | "syncing" | "error" {
  if (status === "active") {
    return "healthy";
  }

  if (status === "pending") {
    return "syncing";
  }

  return "error";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}
