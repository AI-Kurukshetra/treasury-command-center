import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

const { getAppSessionMock, getDashboardSnapshotMock, getReportsPayloadMock } = vi.hoisted(() => ({
  getAppSessionMock: vi.fn(),
  getDashboardSnapshotMock: vi.fn(),
  getReportsPayloadMock: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  getAppSession: getAppSessionMock
}));

vi.mock("@/lib/domain/treasury", () => ({
  getDashboardSnapshot: getDashboardSnapshotMock
}));

vi.mock("@/lib/domain/treasury-api", () => ({
  getReportsPayload: getReportsPayloadMock
}));

import { GET as getSession } from "@/app/api/auth/session/route";
import { GET as getHealth } from "@/app/api/health/route";
import { GET as getNotifications } from "@/app/api/notifications/route";
import { GET as getPositions } from "@/app/api/positions/route";
import { GET as getReports } from "@/app/api/reports/route";

const session = {
  user: { id: "user-1", name: "Local Treasurer", email: "treasurer@local.test", role: "Treasury Admin" },
  organization: { id: "org-1", name: "Atlas Treasury Group" }
};

const snapshot = {
  stats: [],
  positions: [{ entity: "US", bank: "JPM", currency: "USD", available: 100, projected: 120, status: "healthy" }],
  forecasts: [{ week: "W1", actual: 10, forecast: 11 }],
  payments: [{ id: "pay-1", beneficiary: "Acme", amount: 10, currency: "USD", dueDate: "2026-03-14", status: "submitted", approvalsRemaining: 1 }],
  alerts: [{ id: "alt-1", title: "Threshold warning", severity: "warning", detail: "Liquidity watch", action: "Review item" }],
  exposures: [{ currency: "USD", gross: 50, hedged: 10, open: 40 }],
  reports: [{ id: "rep-1", title: "Cash report", type: "Cash", generatedAt: "2026-03-14", status: "ready" }],
  integrations: [{ provider: "JPM API", type: "Bank", status: "healthy", lastSync: "2026-03-14" }]
};

describe("workspace API routes", () => {
  beforeEach(() => {
    getAppSessionMock.mockResolvedValue(session);
    getDashboardSnapshotMock.mockResolvedValue(snapshot);
    getReportsPayloadMock.mockResolvedValue({ reports: snapshot.reports });
  });

  it("returns the current auth session", async () => {
    const response = await getSession();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ session });
  });

  it("returns a health payload", async () => {
    const response = await getHealth();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("treasury-command-center");
  });

  it("protects treasury workspace data routes when unauthenticated", async () => {
    getAppSessionMock.mockResolvedValue(null);
    getReportsPayloadMock.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const [positions, reports, notifications] = await Promise.all([
      getPositions(),
      getReports(),
      getNotifications()
    ]);

    expect(positions.status).toBe(401);
    expect(reports.status).toBe(401);
    expect(notifications.status).toBe(401);
  });

  it("returns treasury snapshot subsets for authorized requests", async () => {
    const [positions, reports, notifications] = await Promise.all([
      getPositions(),
      getReports(),
      getNotifications()
    ]);

    await expect(positions.json()).resolves.toMatchObject({
      positions: snapshot.positions
    });
    await expect(reports.json()).resolves.toEqual({
      reports: snapshot.reports
    });
    await expect(notifications.json()).resolves.toEqual({
      notifications: snapshot.alerts
    });
  });
});
