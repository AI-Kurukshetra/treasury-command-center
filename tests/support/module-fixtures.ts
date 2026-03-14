import { moduleDefinitions } from "@/lib/modules/definitions";
import type { ModuleSlug } from "@/lib/modules/validators";

export const modulePayloadFixtures: Record<ModuleSlug, () => Record<string, unknown>> = {
  "identity-access": () => {
    const stamp = Date.now();
    return {
      name: `Regional Treasurer ${stamp}`,
      description: `Regional operating access ${stamp}`
    };
  },
  "entity-management": () => {
    const stamp = Date.now();
    return {
      name: `Atlas Treasury ${stamp}`,
      countryCode: "IN"
    };
  },
  "bank-connectivity": () => {
    const stamp = Date.now().toString().slice(-4);
    return {
      accountName: `Operating Account ${stamp}`,
      maskedNumber: `****${stamp}`,
      currencyCode: "USD"
    };
  },
  "statement-processing": () => ({
    fileName: `statement-${Date.now()}.mt940`,
    statementDate: "2026-03-14"
  }),
  reconciliation: () => ({
    runDate: "2026-03-14",
    matchedCount: 8,
    exceptionCount: 1
  }),
  "cash-engine": () => ({
    reportingCurrency: "USD",
    freshnessStatus: "fresh"
  }),
  forecasting: () => ({
    name: `Stress Scenario ${Date.now()}`,
    scenarioType: "stress"
  }),
  "payments-approvals": () => ({
    beneficiaryName: `Acme Logistics ${Date.now()}`,
    amount: 125000,
    currencyCode: "USD"
  }),
  "liquidity-intercompany": () => ({
    principalAmount: 500000,
    currencyCode: "USD",
    interestRate: 4.5
  }),
  "risk-hedging": () => ({
    instrumentType: "fx_forward",
    notionalAmount: 750000,
    currencyCode: "USD"
  }),
  investments: () => ({
    instrumentName: `Prime MMF ${Date.now()}`,
    principalAmount: 2000000,
    currencyCode: "USD"
  }),
  "debt-covenants": () => ({
    lenderName: `Lender ${Date.now()}`,
    committedAmount: 5000000,
    currencyCode: "USD"
  }),
  "policies-orchestration": () => ({
    name: `Liquidity Guardrail ${Date.now()}`,
    policyType: "liquidity"
  }),
  "reporting-audit": () => ({
    reportType: "cash_position",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-14"
  }),
  "notifications-mobile": () => ({
    title: `Treasury alert ${Date.now()}`,
    severity: "warning",
    body: "Manual validation alert from automated tests."
  }),
  "dashboards-query": () => ({
    name: `Ops Dashboard ${Date.now()}`,
    widgetType: "metric"
  }),
  "integrations-hub": () => ({
    providerName: `Connector ${Date.now()}`,
    integrationType: "erp"
  }),
  administration: () => ({
    category: "security",
    settingKey: `approval_limit_${Date.now()}`,
    settingValue: "250000"
  })
};

export const moduleTestCases = moduleDefinitions.map((definition) => ({
  slug: definition.slug as ModuleSlug,
  title: definition.title,
  route: definition.route,
  payload: modulePayloadFixtures[definition.slug as ModuleSlug]
}));

