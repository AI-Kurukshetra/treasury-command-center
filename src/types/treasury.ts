import type { Route } from "next";

export type NavItem = {
  title: string;
  href: Route;
  description: string;
};

export type StatCard = {
  label: string;
  value: number;
  change: number;
  currency?: string;
  format?: "currency" | "number";
};

export type CashPosition = {
  entity: string;
  bank: string;
  currency: string;
  available: number;
  projected: number;
  status: "healthy" | "watch" | "critical";
};

export type ForecastPoint = {
  week: string;
  actual: number;
  forecast: number;
};

export type PaymentItem = {
  id: string;
  beneficiary: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: "draft" | "submitted" | "approved" | "released" | "at-risk";
  approvalsRemaining: number;
};

export type AlertItem = {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  detail: string;
  action: string;
};

export type ExposureItem = {
  currency: string;
  gross: number;
  hedged: number;
  open: number;
};

export type ReportItem = {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  status: "ready" | "queued";
};

export type IntegrationItem = {
  provider: string;
  type: string;
  status: "healthy" | "syncing" | "error";
  lastSync: string;
};

export type DashboardSnapshot = {
  stats: StatCard[];
  positions: CashPosition[];
  forecasts: ForecastPoint[];
  payments: PaymentItem[];
  alerts: AlertItem[];
  exposures: ExposureItem[];
  reports: ReportItem[];
  integrations: IntegrationItem[];
};
