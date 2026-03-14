import type { Route } from "next";

import type { DashboardSnapshot, NavItem } from "@/types/treasury";

export const marketingHighlights = [
  {
    title: "Real-time global liquidity visibility",
    detail:
      "Consolidate balances across subsidiaries, currencies, and banking partners into one operating view."
  },
  {
    title: "Controlled payments and approvals",
    detail:
      "Run policy-based payment workflows with approval routing, step-up controls, and full audit history."
  },
  {
    title: "Forecasting and risk coverage",
    detail:
      "Monitor short-term liquidity, forecast cash movements, and track open FX exposure from the same platform."
  }
];

export const primaryNavigation: NavItem[] = [
  {
    title: "Modules",
    href: "/modules" as Route,
    description: "Full platform module catalog and operational surfaces."
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Executive overview and current liquidity posture."
  },
  {
    title: "Cash",
    href: "/cash",
    description: "Current positions by entity, bank, and currency."
  },
  {
    title: "Forecasts",
    href: "/forecasts",
    description: "Short-term and long-term cash planning."
  },
  {
    title: "Payments",
    href: "/payments",
    description: "Approvals, release queues, and payment operations."
  },
  {
    title: "Risk",
    href: "/risk",
    description: "Exposure, hedge coverage, and watch items."
  },
  {
    title: "Reports",
    href: "/reports",
    description: "Treasury reporting, exports, and compliance packs."
  },
  {
    title: "Integrations",
    href: "/integrations",
    description: "Banks, ERP sync, and connector health."
  },
  {
    title: "Admin",
    href: "/admin",
    description: "Organizations, users, roles, and policy controls."
  }
];

export const dashboardSnapshot: DashboardSnapshot = {
  stats: [
    { label: "Global cash", value: 128450000, change: 4.8, format: "currency" },
    { label: "Available liquidity", value: 92400000, change: 3.2, format: "currency" },
    { label: "Forecast variance", value: 2150000, change: -1.4, format: "currency" },
    { label: "Payments queued", value: 43, change: 9.5, format: "number" }
  ],
  positions: [
    {
      entity: "US Holdings",
      bank: "JPMorgan",
      currency: "USD",
      available: 46300000,
      projected: 45120000,
      status: "healthy"
    },
    {
      entity: "EMEA Treasury",
      bank: "HSBC",
      currency: "EUR",
      available: 18800000,
      projected: 17150000,
      status: "watch"
    },
    {
      entity: "APAC Operations",
      bank: "DBS",
      currency: "SGD",
      available: 12100000,
      projected: 12750000,
      status: "healthy"
    },
    {
      entity: "LATAM Shared Services",
      bank: "Citi",
      currency: "BRL",
      available: 6900000,
      projected: 5100000,
      status: "critical"
    }
  ],
  forecasts: [
    { week: "W1", actual: 118, forecast: 120 },
    { week: "W2", actual: 122, forecast: 121 },
    { week: "W3", actual: 117, forecast: 119 },
    { week: "W4", actual: 126, forecast: 123 },
    { week: "W5", actual: 130, forecast: 127 },
    { week: "W6", actual: 128, forecast: 129 }
  ],
  payments: [
    {
      id: "PAY-2026-144",
      beneficiary: "Nordic Steel GmbH",
      amount: 425000,
      currency: "EUR",
      dueDate: "2026-03-18",
      status: "submitted",
      approvalsRemaining: 1
    },
    {
      id: "PAY-2026-145",
      beneficiary: "Zenith Logistics",
      amount: 190000,
      currency: "USD",
      dueDate: "2026-03-16",
      status: "approved",
      approvalsRemaining: 0
    },
    {
      id: "PAY-2026-146",
      beneficiary: "Kyowa Components",
      amount: 670000,
      currency: "JPY",
      dueDate: "2026-03-19",
      status: "at-risk",
      approvalsRemaining: 2
    }
  ],
  alerts: [
    {
      id: "ALT-1",
      title: "LATAM liquidity threshold breached",
      severity: "critical",
      detail: "Projected BRL concentration drops below the minimum operating buffer tomorrow.",
      action: "Review sweep plan"
    },
    {
      id: "ALT-2",
      title: "Covenant headroom tightened",
      severity: "warning",
      detail: "Leverage ratio forecast is within 6% of the facility threshold for Q2.",
      action: "Open debt workspace"
    },
    {
      id: "ALT-3",
      title: "HSBC connector completed with partial data",
      severity: "info",
      detail: "One statement file is still processing in the OCR queue.",
      action: "Inspect integration health"
    }
  ],
  exposures: [
    { currency: "EUR", gross: 18400000, hedged: 9900000, open: 8500000 },
    { currency: "GBP", gross: 9200000, hedged: 4800000, open: 4400000 },
    { currency: "JPY", gross: 11500000, hedged: 2100000, open: 9400000 }
  ],
  reports: [
    {
      id: "RPT-1001",
      title: "Daily cash position",
      type: "Cash",
      generatedAt: "2026-03-14 09:40 UTC",
      status: "ready"
    },
    {
      id: "RPT-1002",
      title: "Weekly liquidity forecast",
      type: "Forecast",
      generatedAt: "2026-03-14 08:15 UTC",
      status: "ready"
    },
    {
      id: "RPT-1003",
      title: "Quarterly compliance pack",
      type: "Compliance",
      generatedAt: "Queued",
      status: "queued"
    }
  ],
  integrations: [
    {
      provider: "JPMorgan API",
      type: "Bank",
      status: "healthy",
      lastSync: "2 min ago"
    },
    {
      provider: "SAP S/4HANA",
      type: "ERP",
      status: "syncing",
      lastSync: "Running"
    },
    {
      provider: "HSBC Statements",
      type: "Bank",
      status: "error",
      lastSync: "38 min ago"
    }
  ]
};
