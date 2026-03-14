import type { ModuleSlug } from "@/lib/modules/validators";

export type SrsCoverageEntry = {
  id: string;
  title: string;
  moduleSlug: ModuleSlug;
  moduleRoute: string;
  workspaceRoute: string;
  apiPath: string;
};

const moduleRoute = (slug: ModuleSlug) => `/modules/${slug}`;

export const srsCoverage: SrsCoverageEntry[] = [
  {
    id: "CF-01",
    title: "Real-time Cash Position Dashboard",
    moduleSlug: "cash-engine",
    moduleRoute: moduleRoute("cash-engine"),
    workspaceRoute: "/dashboard",
    apiPath: "/api/positions"
  },
  {
    id: "CF-02",
    title: "Multi-bank Connectivity",
    moduleSlug: "bank-connectivity",
    moduleRoute: moduleRoute("bank-connectivity"),
    workspaceRoute: "/integrations",
    apiPath: "/api/modules/bank-connectivity"
  },
  {
    id: "CF-03",
    title: "Cash Flow Forecasting",
    moduleSlug: "forecasting",
    moduleRoute: moduleRoute("forecasting"),
    workspaceRoute: "/forecasts",
    apiPath: "/api/modules/forecasting"
  },
  {
    id: "CF-04",
    title: "Payment Initiation and Approval Workflows",
    moduleSlug: "payments-approvals",
    moduleRoute: moduleRoute("payments-approvals"),
    workspaceRoute: "/payments",
    apiPath: "/api/modules/payments-approvals"
  },
  {
    id: "CF-05",
    title: "Bank Account Management",
    moduleSlug: "bank-connectivity",
    moduleRoute: moduleRoute("bank-connectivity"),
    workspaceRoute: "/cash",
    apiPath: "/api/modules/bank-connectivity"
  },
  {
    id: "CF-06",
    title: "Multi-currency Support",
    moduleSlug: "cash-engine",
    moduleRoute: moduleRoute("cash-engine"),
    workspaceRoute: "/cash",
    apiPath: "/api/positions"
  },
  {
    id: "CF-07",
    title: "Liquidity Management",
    moduleSlug: "liquidity-intercompany",
    moduleRoute: moduleRoute("liquidity-intercompany"),
    workspaceRoute: "/modules/liquidity-intercompany",
    apiPath: "/api/modules/liquidity-intercompany"
  },
  {
    id: "CF-08",
    title: "Treasury Reporting Suite",
    moduleSlug: "reporting-audit",
    moduleRoute: moduleRoute("reporting-audit"),
    workspaceRoute: "/reports",
    apiPath: "/api/reports"
  },
  {
    id: "CF-09",
    title: "Risk Management Dashboard",
    moduleSlug: "risk-hedging",
    moduleRoute: moduleRoute("risk-hedging"),
    workspaceRoute: "/risk",
    apiPath: "/api/modules/risk-hedging"
  },
  {
    id: "CF-10",
    title: "Investment Management",
    moduleSlug: "investments",
    moduleRoute: moduleRoute("investments"),
    workspaceRoute: "/modules/investments",
    apiPath: "/api/modules/investments"
  },
  {
    id: "CF-11",
    title: "Debt and Credit Facility Tracking",
    moduleSlug: "debt-covenants",
    moduleRoute: moduleRoute("debt-covenants"),
    workspaceRoute: "/modules/debt-covenants",
    apiPath: "/api/modules/debt-covenants"
  },
  {
    id: "CF-12",
    title: "ERP Integration Hub",
    moduleSlug: "integrations-hub",
    moduleRoute: moduleRoute("integrations-hub"),
    workspaceRoute: "/integrations",
    apiPath: "/api/modules/integrations-hub"
  },
  {
    id: "CF-13",
    title: "Automated Bank Statement Processing",
    moduleSlug: "statement-processing",
    moduleRoute: moduleRoute("statement-processing"),
    workspaceRoute: "/modules/statement-processing",
    apiPath: "/api/modules/statement-processing"
  },
  {
    id: "CF-14",
    title: "Treasury Policy Engine",
    moduleSlug: "policies-orchestration",
    moduleRoute: moduleRoute("policies-orchestration"),
    workspaceRoute: "/admin",
    apiPath: "/api/modules/policies-orchestration"
  },
  {
    id: "CF-15",
    title: "Audit Trail and Compliance",
    moduleSlug: "reporting-audit",
    moduleRoute: moduleRoute("reporting-audit"),
    workspaceRoute: "/reports",
    apiPath: "/api/reports"
  },
  {
    id: "CF-16",
    title: "Mobile Treasury App",
    moduleSlug: "notifications-mobile",
    moduleRoute: moduleRoute("notifications-mobile"),
    workspaceRoute: "/modules/notifications-mobile",
    apiPath: "/api/notifications"
  },
  {
    id: "CF-17",
    title: "Hedging Operations Management",
    moduleSlug: "risk-hedging",
    moduleRoute: moduleRoute("risk-hedging"),
    workspaceRoute: "/risk",
    apiPath: "/api/modules/risk-hedging"
  },
  {
    id: "CF-18",
    title: "Inter-company Netting",
    moduleSlug: "liquidity-intercompany",
    moduleRoute: moduleRoute("liquidity-intercompany"),
    workspaceRoute: "/modules/liquidity-intercompany",
    apiPath: "/api/modules/liquidity-intercompany"
  },
  {
    id: "CF-19",
    title: "Bank Relationship Management",
    moduleSlug: "bank-connectivity",
    moduleRoute: moduleRoute("bank-connectivity"),
    workspaceRoute: "/integrations",
    apiPath: "/api/modules/bank-connectivity"
  },
  {
    id: "CF-20",
    title: "Cash Concentration and Pooling",
    moduleSlug: "liquidity-intercompany",
    moduleRoute: moduleRoute("liquidity-intercompany"),
    workspaceRoute: "/modules/liquidity-intercompany",
    apiPath: "/api/modules/liquidity-intercompany"
  },
  {
    id: "CF-21",
    title: "Treasury Calendar and Events",
    moduleSlug: "debt-covenants",
    moduleRoute: moduleRoute("debt-covenants"),
    workspaceRoute: "/modules/debt-covenants",
    apiPath: "/api/modules/debt-covenants"
  },
  {
    id: "CF-22",
    title: "Custom Dashboard Builder",
    moduleSlug: "dashboards-query",
    moduleRoute: moduleRoute("dashboards-query"),
    workspaceRoute: "/modules/dashboards-query",
    apiPath: "/api/modules/dashboards-query"
  },
  {
    id: "AF-01",
    title: "AI-Powered Cash Flow Predictions",
    moduleSlug: "forecasting",
    moduleRoute: moduleRoute("forecasting"),
    workspaceRoute: "/forecasts",
    apiPath: "/api/modules/forecasting"
  },
  {
    id: "AF-02",
    title: "Blockchain Settlement Network",
    moduleSlug: "integrations-hub",
    moduleRoute: moduleRoute("integrations-hub"),
    workspaceRoute: "/integrations",
    apiPath: "/api/modules/integrations-hub"
  },
  {
    id: "AF-03",
    title: "Smart Contract Automation",
    moduleSlug: "policies-orchestration",
    moduleRoute: moduleRoute("policies-orchestration"),
    workspaceRoute: "/modules/policies-orchestration",
    apiPath: "/api/modules/policies-orchestration"
  },
  {
    id: "AF-04",
    title: "Predictive Risk Analytics",
    moduleSlug: "risk-hedging",
    moduleRoute: moduleRoute("risk-hedging"),
    workspaceRoute: "/risk",
    apiPath: "/api/modules/risk-hedging"
  },
  {
    id: "AF-05",
    title: "Natural Language Query Interface",
    moduleSlug: "dashboards-query",
    moduleRoute: moduleRoute("dashboards-query"),
    workspaceRoute: "/modules/dashboards-query",
    apiPath: "/api/modules/dashboards-query"
  },
  {
    id: "AF-06",
    title: "Dynamic Hedging Recommendations",
    moduleSlug: "risk-hedging",
    moduleRoute: moduleRoute("risk-hedging"),
    workspaceRoute: "/risk",
    apiPath: "/api/modules/risk-hedging"
  },
  {
    id: "AF-07",
    title: "Real-time Market Intelligence",
    moduleSlug: "risk-hedging",
    moduleRoute: moduleRoute("risk-hedging"),
    workspaceRoute: "/risk",
    apiPath: "/api/modules/risk-hedging"
  },
  {
    id: "AF-08",
    title: "Automated Covenant Monitoring",
    moduleSlug: "debt-covenants",
    moduleRoute: moduleRoute("debt-covenants"),
    workspaceRoute: "/modules/debt-covenants",
    apiPath: "/api/modules/debt-covenants"
  },
  {
    id: "AF-09",
    title: "Treasury Workflow Orchestration",
    moduleSlug: "policies-orchestration",
    moduleRoute: moduleRoute("policies-orchestration"),
    workspaceRoute: "/admin",
    apiPath: "/api/modules/policies-orchestration"
  },
  {
    id: "AF-10",
    title: "Quantum-Safe Security Framework",
    moduleSlug: "identity-access",
    moduleRoute: moduleRoute("identity-access"),
    workspaceRoute: "/admin",
    apiPath: "/api/auth/session"
  },
  {
    id: "AF-11",
    title: "ESG Treasury Metrics",
    moduleSlug: "reporting-audit",
    moduleRoute: moduleRoute("reporting-audit"),
    workspaceRoute: "/reports",
    apiPath: "/api/reports"
  },
  {
    id: "AF-12",
    title: "Digital Twin Cash Flow Modeling",
    moduleSlug: "forecasting",
    moduleRoute: moduleRoute("forecasting"),
    workspaceRoute: "/forecasts",
    apiPath: "/api/modules/forecasting"
  },
  {
    id: "AF-13",
    title: "Cross-Border Payment Optimization",
    moduleSlug: "payments-approvals",
    moduleRoute: moduleRoute("payments-approvals"),
    workspaceRoute: "/payments",
    apiPath: "/api/modules/payments-approvals"
  },
  {
    id: "PF-01",
    title: "Authentication and Authorization",
    moduleSlug: "identity-access",
    moduleRoute: moduleRoute("identity-access"),
    workspaceRoute: "/auth/sign-in",
    apiPath: "/api/auth/session"
  },
  {
    id: "PF-02",
    title: "Notifications and Alerts",
    moduleSlug: "notifications-mobile",
    moduleRoute: moduleRoute("notifications-mobile"),
    workspaceRoute: "/dashboard",
    apiPath: "/api/notifications"
  },
  {
    id: "PF-03",
    title: "System Administration",
    moduleSlug: "administration",
    moduleRoute: moduleRoute("administration"),
    workspaceRoute: "/admin",
    apiPath: "/api/modules/administration"
  },
  {
    id: "PF-04",
    title: "Reconciliation Capability",
    moduleSlug: "reconciliation",
    moduleRoute: moduleRoute("reconciliation"),
    workspaceRoute: "/modules/reconciliation",
    apiPath: "/api/modules/reconciliation"
  },
  {
    id: "PF-05",
    title: "Entity and Organization Management",
    moduleSlug: "entity-management",
    moduleRoute: moduleRoute("entity-management"),
    workspaceRoute: "/admin",
    apiPath: "/api/modules/entity-management"
  },
  {
    id: "PF-06",
    title: "Counterparty Management",
    moduleSlug: "risk-hedging",
    moduleRoute: moduleRoute("risk-hedging"),
    workspaceRoute: "/modules/risk-hedging",
    apiPath: "/api/modules/risk-hedging"
  },
  {
    id: "PF-07",
    title: "Audit Log Querying",
    moduleSlug: "reporting-audit",
    moduleRoute: moduleRoute("reporting-audit"),
    workspaceRoute: "/reports",
    apiPath: "/api/reports"
  },
  {
    id: "PF-08",
    title: "Policy-Driven Workflow Rules",
    moduleSlug: "policies-orchestration",
    moduleRoute: moduleRoute("policies-orchestration"),
    workspaceRoute: "/admin",
    apiPath: "/api/modules/policies-orchestration"
  }
];

export const allSrsFeatureIds = srsCoverage.map((entry) => entry.id);
