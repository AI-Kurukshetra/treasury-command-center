import type { ModuleDefinition } from "@/types/modules";

export const moduleDefinitions: ModuleDefinition[] = [
  {
    id: "M-01",
    slug: "identity-access",
    title: "Identity and Access Management",
    description: "Authentication, roles, session controls, and privileged access boundaries.",
    category: "support",
    priority: "must-have",
    primaryTable: "roles",
    recordsLabel: "roles",
    route: "/modules/identity-access",
    fields: [
      { name: "name", label: "Role name", type: "text", placeholder: "Regional Treasurer" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Scope and permissions" }
    ]
  },
  {
    id: "M-02",
    slug: "entity-management",
    title: "Organization and Entity Management",
    description: "Manage organizations, subsidiaries, legal entities, and operating scope.",
    category: "support",
    priority: "must-have",
    primaryTable: "subsidiaries",
    recordsLabel: "entities",
    route: "/modules/entity-management",
    fields: [
      { name: "name", label: "Entity name", type: "text", placeholder: "Atlas Treasury UK" },
      { name: "countryCode", label: "Country code", type: "text", placeholder: "GB" }
    ]
  },
  {
    id: "M-03",
    slug: "bank-connectivity",
    title: "Bank Connectivity and Account Management",
    description: "Bank connections, account registry, partner metadata, and connectivity health.",
    category: "core",
    priority: "must-have",
    primaryTable: "bank_accounts",
    recordsLabel: "accounts",
    route: "/modules/bank-connectivity",
    fields: [
      { name: "accountName", label: "Account name", type: "text", placeholder: "EMEA operating account" },
      { name: "maskedNumber", label: "Masked number", type: "text", placeholder: "****9912" },
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
    ]
  },
  {
    id: "M-04",
    slug: "statement-processing",
    title: "Transaction Ingestion and Statement Processing",
    description: "Statement ingestion, MT940 handling, OCR extraction, and processing telemetry.",
    category: "core",
    priority: "must-have",
    primaryTable: "bank_statements",
    recordsLabel: "statements",
    route: "/modules/statement-processing",
    fields: [
      { name: "fileName", label: "File name", type: "text", placeholder: "atlas-emea.mt940" },
      { name: "statementDate", label: "Statement date", type: "date" }
    ]
  },
  {
    id: "M-05",
    slug: "reconciliation",
    title: "Reconciliation Engine",
    description: "Match bank activity against expected balances, internal references, and ERP evidence.",
    category: "core",
    priority: "must-have",
    primaryTable: "reconciliation_runs",
    recordsLabel: "reconciliation runs",
    route: "/modules/reconciliation",
    fields: [
      { name: "runDate", label: "Run date", type: "date" },
      { name: "matchedCount", label: "Matched count", type: "number", step: "1", placeholder: "32" },
      { name: "exceptionCount", label: "Exception count", type: "number", step: "1", placeholder: "2" }
    ]
  },
  {
    id: "M-06",
    slug: "cash-engine",
    title: "Cash Position Engine and Dashboard",
    description: "Consolidated balances, liquidity posture, and live multi-entity visibility.",
    category: "core",
    priority: "must-have",
    primaryTable: "cash_position_snapshots",
    recordsLabel: "snapshots",
    route: "/modules/cash-engine",
    fields: [
      {
        name: "reportingCurrency",
        label: "Reporting currency",
        type: "select",
        options: [
          { label: "USD", value: "USD" },
          { label: "EUR", value: "EUR" }
        ]
      },
      {
        name: "freshnessStatus",
        label: "Freshness",
        type: "select",
        options: [
          { label: "Fresh", value: "fresh" },
          { label: "Stale", value: "stale" },
          { label: "Partial", value: "partial" }
        ]
      }
    ]
  },
  {
    id: "M-07",
    slug: "forecasting",
    title: "Forecasting and Scenario Analytics",
    description: "Forecast scenarios, scenario assumptions, and forward-looking liquidity analysis.",
    category: "core",
    priority: "must-have",
    primaryTable: "forecast_scenarios",
    recordsLabel: "scenarios",
    route: "/modules/forecasting",
    fields: [
      { name: "name", label: "Scenario name", type: "text", placeholder: "Collection delay stress" },
      {
        name: "scenarioType",
        label: "Scenario type",
        type: "select",
        options: [
          { label: "Base case", value: "base_case" },
          { label: "Stress", value: "stress" },
          { label: "Optimistic", value: "optimistic" }
        ]
      }
    ]
  },
  {
    id: "M-08",
    slug: "payments-approvals",
    title: "Payments and Approval Workflow Engine",
    description: "Payment initiation, approval routing, signatures, and release state management.",
    category: "core",
    priority: "must-have",
    primaryTable: "payments",
    recordsLabel: "payments",
    route: "/modules/payments-approvals",
    fields: [
      { name: "beneficiaryName", label: "Beneficiary", type: "text", placeholder: "Acme Logistics" },
      { name: "amount", label: "Amount", type: "number", step: "0.01", placeholder: "125000" },
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
    ]
  },
  {
    id: "M-09",
    slug: "liquidity-intercompany",
    title: "Liquidity, Pooling, and Inter-company Management",
    description: "Pooling, concentration, netting, and inter-company funding relationships.",
    category: "advanced",
    priority: "important",
    primaryTable: "intercompany_loans",
    recordsLabel: "inter-company positions",
    route: "/modules/liquidity-intercompany",
    fields: [
      { name: "principalAmount", label: "Principal", type: "number", step: "0.01", placeholder: "500000" },
      {
        name: "currencyCode",
        label: "Currency",
        type: "select",
        options: [
          { label: "USD", value: "USD" },
          { label: "EUR", value: "EUR" }
        ]
      },
      { name: "interestRate", label: "Interest rate", type: "number", step: "0.01", placeholder: "4.5" }
    ]
  },
  {
    id: "M-10",
    slug: "risk-hedging",
    title: "FX, Risk, and Hedging Management",
    description: "Rates, exposures, hedges, and market intelligence for treasury risk control.",
    category: "advanced",
    priority: "important",
    primaryTable: "hedging_instruments",
    recordsLabel: "hedges",
    route: "/modules/risk-hedging",
    fields: [
      {
        name: "instrumentType",
        label: "Instrument type",
        type: "select",
        options: [
          { label: "FX Forward", value: "fx_forward" },
          { label: "Option", value: "option" },
          { label: "Swap", value: "swap" }
        ]
      },
      { name: "notionalAmount", label: "Notional", type: "number", step: "0.01", placeholder: "750000" },
      {
        name: "currencyCode",
        label: "Currency",
        type: "select",
        options: [
          { label: "USD", value: "USD" },
          { label: "EUR", value: "EUR" }
        ]
      }
    ]
  },
  {
    id: "M-11",
    slug: "investments",
    title: "Investment Management",
    description: "Short-term investment placements, current valuation, and maturity tracking.",
    category: "advanced",
    priority: "important",
    primaryTable: "investments",
    recordsLabel: "investments",
    route: "/modules/investments",
    fields: [
      { name: "instrumentName", label: "Instrument", type: "text", placeholder: "Prime MMF" },
      { name: "principalAmount", label: "Principal", type: "number", step: "0.01", placeholder: "2000000" },
      {
        name: "currencyCode",
        label: "Currency",
        type: "select",
        options: [
          { label: "USD", value: "USD" },
          { label: "EUR", value: "EUR" }
        ]
      }
    ]
  },
  {
    id: "M-12",
    slug: "debt-covenants",
    title: "Debt and Covenant Management",
    description: "Facilities, covenant tests, maturities, and treasury calendar commitments.",
    category: "advanced",
    priority: "important",
    primaryTable: "debt_facilities",
    recordsLabel: "facilities",
    route: "/modules/debt-covenants",
    fields: [
      { name: "lenderName", label: "Lender", type: "text", placeholder: "Global Credit Bank" },
      { name: "committedAmount", label: "Committed amount", type: "number", step: "0.01", placeholder: "10000000" },
      {
        name: "currencyCode",
        label: "Currency",
        type: "select",
        options: [
          { label: "USD", value: "USD" },
          { label: "EUR", value: "EUR" }
        ]
      }
    ]
  },
  {
    id: "M-13",
    slug: "policies-orchestration",
    title: "Policy and Orchestration Engine",
    description: "Treasury rules, policy versions, and workflow orchestration controls.",
    category: "advanced",
    priority: "important",
    primaryTable: "treasury_policies",
    recordsLabel: "policies",
    route: "/modules/policies-orchestration",
    fields: [
      { name: "name", label: "Policy name", type: "text", placeholder: "Liquidity buffer policy" },
      {
        name: "policyType",
        label: "Policy type",
        type: "select",
        options: [
          { label: "Approval", value: "approval" },
          { label: "Liquidity", value: "liquidity" },
          { label: "Risk", value: "risk" }
        ]
      }
    ]
  },
  {
    id: "M-14",
    slug: "reporting-audit",
    title: "Reporting, Audit, and Compliance",
    description: "Operational reporting, audit evidence, and compliance output generation.",
    category: "core",
    priority: "must-have",
    primaryTable: "compliance_reports",
    recordsLabel: "reports",
    route: "/modules/reporting-audit",
    fields: [
      {
        name: "reportType",
        label: "Report type",
        type: "select",
        options: [
          { label: "Cash Position", value: "cash_position" },
          { label: "Liquidity", value: "liquidity" },
          { label: "Compliance", value: "compliance" }
        ]
      },
      { name: "periodStart", label: "Period start", type: "date" },
      { name: "periodEnd", label: "Period end", type: "date" }
    ]
  },
  {
    id: "M-15",
    slug: "notifications-mobile",
    title: "Notifications and Mobile Experience",
    description: "Alerts, messaging, mobile approvals, and device posture visibility.",
    category: "support",
    priority: "important",
    primaryTable: "notifications",
    recordsLabel: "alerts",
    route: "/modules/notifications-mobile",
    fields: [
      { name: "title", label: "Alert title", type: "text", placeholder: "Counterparty exposure threshold" },
      {
        name: "severity",
        label: "Severity",
        type: "select",
        options: [
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Critical", value: "critical" }
        ]
      },
      { name: "body", label: "Detail", type: "textarea", placeholder: "Describe the alert context" }
    ]
  },
  {
    id: "M-16",
    slug: "dashboards-query",
    title: "Dashboard Personalization and Query Interface",
    description: "Custom dashboards, widget layout, and natural-language treasury query history.",
    category: "advanced",
    priority: "nice-to-have",
    primaryTable: "dashboards",
    recordsLabel: "dashboards",
    route: "/modules/dashboards-query",
    fields: [
      { name: "name", label: "Dashboard name", type: "text", placeholder: "Regional liquidity cockpit" },
      {
        name: "widgetType",
        label: "Starter widget",
        type: "select",
        options: [
          { label: "Metric", value: "metric" },
          { label: "Chart", value: "chart" },
          { label: "Feed", value: "feed" }
        ]
      }
    ]
  },
  {
    id: "M-17",
    slug: "integrations-hub",
    title: "Integrations Hub",
    description: "Connector lifecycle, ERP sync visibility, and external data orchestration.",
    category: "core",
    priority: "must-have",
    primaryTable: "integration_connections",
    recordsLabel: "connections",
    route: "/modules/integrations-hub",
    fields: [
      { name: "providerName", label: "Provider", type: "text", placeholder: "SAP S/4HANA" },
      {
        name: "integrationType",
        label: "Integration type",
        type: "select",
        options: [
          { label: "ERP", value: "erp" },
          { label: "Bank", value: "bank" },
          { label: "Market data", value: "market_data" }
        ]
      }
    ]
  },
  {
    id: "M-18",
    slug: "administration",
    title: "Administration and Platform Operations",
    description: "Platform settings, tenant controls, operational health, and support posture.",
    category: "support",
    priority: "must-have",
    primaryTable: "platform_settings",
    recordsLabel: "settings",
    route: "/modules/administration",
    fields: [
      { name: "category", label: "Category", type: "text", placeholder: "security" },
      { name: "settingKey", label: "Setting key", type: "text", placeholder: "session_timeout_minutes" },
      { name: "settingValue", label: "Setting value", type: "text", placeholder: "45" }
    ]
  }
];

export const moduleDefinitionsBySlug = Object.fromEntries(
  moduleDefinitions.map((definition) => [definition.slug, definition])
);
