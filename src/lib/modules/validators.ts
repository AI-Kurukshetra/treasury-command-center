import { z } from "zod";

import { moduleDefinitions } from "@/lib/modules/definitions";

export const moduleSlugSchema = z.enum(
  moduleDefinitions.map((definition) => definition.slug) as [string, ...string[]]
);

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const numericString = (label: string) =>
  z.coerce.number().finite(`${label} must be a number.`);

export const moduleRecordSchemas = {
  "identity-access": z.object({
    name: requiredText("Role name"),
    description: requiredText("Description")
  }),
  "entity-management": z.object({
    name: requiredText("Entity name"),
    countryCode: z.string().trim().length(2, "Country code must be 2 letters.").transform((value) => value.toUpperCase())
  }),
  "bank-connectivity": z.object({
    accountName: requiredText("Account name"),
    maskedNumber: requiredText("Masked number"),
    currencyCode: z.enum(["USD", "EUR", "GBP"])
  }),
  "statement-processing": z.object({
    fileName: requiredText("File name"),
    statementDate: requiredText("Statement date")
  }),
  reconciliation: z.object({
    runDate: requiredText("Run date"),
    matchedCount: numericString("Matched count").int().min(0),
    exceptionCount: numericString("Exception count").int().min(0)
  }),
  "cash-engine": z.object({
    reportingCurrency: z.enum(["USD", "EUR"]),
    freshnessStatus: z.enum(["fresh", "stale", "partial"])
  }),
  forecasting: z.object({
    name: requiredText("Scenario name"),
    scenarioType: z.enum(["base_case", "stress", "optimistic"])
  }),
  "payments-approvals": z.object({
    beneficiaryName: requiredText("Beneficiary"),
    amount: numericString("Amount").positive("Amount must be greater than zero."),
    currencyCode: z.enum(["USD", "EUR", "GBP"])
  }),
  "liquidity-intercompany": z.object({
    principalAmount: numericString("Principal").positive(),
    currencyCode: z.enum(["USD", "EUR"]),
    interestRate: numericString("Interest rate").min(0)
  }),
  "risk-hedging": z.object({
    instrumentType: z.enum(["fx_forward", "option", "swap"]),
    notionalAmount: numericString("Notional").positive(),
    currencyCode: z.enum(["USD", "EUR"])
  }),
  investments: z.object({
    instrumentName: requiredText("Instrument"),
    principalAmount: numericString("Principal").positive(),
    currencyCode: z.enum(["USD", "EUR"])
  }),
  "debt-covenants": z.object({
    lenderName: requiredText("Lender"),
    committedAmount: numericString("Committed amount").positive(),
    currencyCode: z.enum(["USD", "EUR"])
  }),
  "policies-orchestration": z.object({
    name: requiredText("Policy name"),
    policyType: z.enum(["approval", "liquidity", "risk"])
  }),
  "reporting-audit": z.object({
    reportType: z.enum(["cash_position", "liquidity", "compliance"]),
    periodStart: requiredText("Period start"),
    periodEnd: requiredText("Period end")
  }),
  "notifications-mobile": z.object({
    title: requiredText("Title"),
    severity: z.enum(["info", "warning", "critical"]),
    body: requiredText("Detail")
  }),
  "dashboards-query": z.object({
    name: requiredText("Dashboard name"),
    widgetType: z.enum(["metric", "chart", "feed"])
  }),
  "integrations-hub": z.object({
    providerName: requiredText("Provider"),
    integrationType: z.enum(["erp", "bank", "market_data"])
  }),
  administration: z.object({
    category: requiredText("Category"),
    settingKey: requiredText("Setting key"),
    settingValue: requiredText("Setting value")
  })
};

export type ModuleSlug = z.infer<typeof moduleSlugSchema>;
export type ModuleRecordPayload = Record<string, unknown>;
