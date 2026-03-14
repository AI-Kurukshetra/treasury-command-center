import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

const serviceMocks = vi.hoisted(() => ({
  getAccountsPayload: vi.fn(),
  createAccountsRecord: vi.fn(),
  getCashPositionsPayload: vi.fn(),
  createCashPositionsRecord: vi.fn(),
  getFxPayload: vi.fn(),
  createFxRecord: vi.fn(),
  getPaymentsPayload: vi.fn(),
  createPaymentsRecord: vi.fn(),
  getAdminPayload: vi.fn(),
  createAdminRecord: vi.fn(),
  getDashboardsPayload: vi.fn(),
  createDashboardRecord: vi.fn(),
  getQueryPayload: vi.fn(),
  createQueryRecord: vi.fn(),
  getReportsPayload: vi.fn(),
  createReportRecord: vi.fn()
}));

vi.mock("@/lib/domain/treasury-api", () => serviceMocks);

import { GET as getAccounts, POST as postAccounts } from "@/app/api/accounts/route";
import { GET as getAdmin, POST as postAdmin } from "@/app/api/admin/route";
import { GET as getCashPositions, POST as postCashPositions } from "@/app/api/cash-positions/route";
import { GET as getDashboards, POST as postDashboards } from "@/app/api/dashboards/route";
import { GET as getFx, POST as postFx } from "@/app/api/fx/route";
import { GET as getPayments, POST as postPayments } from "@/app/api/payments/route";
import { GET as getQuery, POST as postQuery } from "@/app/api/query/route";
import { GET as getReports, POST as postReports } from "@/app/api/reports/route";

describe("treasury domain API routes", () => {
  beforeEach(() => {
    Object.values(serviceMocks).forEach((mock) => mock.mockReset());
  });

  it("returns accounts data and create results", async () => {
    serviceMocks.getAccountsPayload.mockResolvedValue({ accounts: [{ id: "acc-1" }] });
    serviceMocks.createAccountsRecord.mockResolvedValue({ ok: true, recordType: "bank_account" });

    const getResponse = await getAccounts();
    const postResponse = await postAccounts(
      new Request("http://localhost/api/accounts", {
        method: "POST",
        body: JSON.stringify({ recordType: "bank_account" }),
        headers: { "content-type": "application/json" }
      })
    );

    await expect(getResponse.json()).resolves.toEqual({ accounts: [{ id: "acc-1" }] });
    await expect(postResponse.json()).resolves.toEqual({ ok: true, recordType: "bank_account" });
  });

  it("returns cash position data and handles snapshot creation", async () => {
    serviceMocks.getCashPositionsPayload.mockResolvedValue({ snapshots: [{ id: "snap-1" }] });
    serviceMocks.createCashPositionsRecord.mockResolvedValue({ ok: true, lineCount: 3 });

    const getResponse = await getCashPositions();
    const postResponse = await postCashPositions(
      new Request("http://localhost/api/cash-positions", {
        method: "POST",
        body: JSON.stringify({ reportingCurrencyCode: "USD" }),
        headers: { "content-type": "application/json" }
      })
    );

    await expect(getResponse.json()).resolves.toEqual({ snapshots: [{ id: "snap-1" }] });
    await expect(postResponse.json()).resolves.toEqual({ ok: true, lineCount: 3 });
  });

  it("passes request context to FX reads and writes", async () => {
    serviceMocks.getFxPayload.mockResolvedValue({
      conversion: { base: "USD", quote: "EUR", amount: 10, convertedAmount: 9.2, rate: 0.92 }
    });
    serviceMocks.createFxRecord.mockResolvedValue({ ok: true, record: { id: "rate-1" } });

    const getRequest = new Request("http://localhost/api/fx?base=USD&quote=EUR&amount=10");
    const getResponse = await getFx(getRequest);
    const postResponse = await postFx(
      new Request("http://localhost/api/fx", {
        method: "POST",
        body: JSON.stringify({ baseCurrencyCode: "USD", quoteCurrencyCode: "EUR", rate: 0.92, source: "manual" }),
        headers: { "content-type": "application/json" }
      })
    );

    expect(serviceMocks.getFxPayload).toHaveBeenCalledWith(getRequest);
    await expect(getResponse.json()).resolves.toMatchObject({
      conversion: { convertedAmount: 9.2 }
    });
    await expect(postResponse.json()).resolves.toEqual({ ok: true, record: { id: "rate-1" } });
  });

  it("returns payment and admin payloads", async () => {
    serviceMocks.getPaymentsPayload.mockResolvedValue({ payments: [{ id: "pay-1" }] });
    serviceMocks.createPaymentsRecord.mockResolvedValue({ ok: true, payment: { id: "pay-2" } });
    serviceMocks.getAdminPayload.mockResolvedValue({ roles: [{ id: "role-1" }] });
    serviceMocks.createAdminRecord.mockResolvedValue({ ok: true, record: { id: "setting-1" } });

    const [paymentsGet, paymentsPost, adminGet, adminPost] = await Promise.all([
      getPayments(),
      postPayments(
        new Request("http://localhost/api/payments", {
          method: "POST",
          body: JSON.stringify({ beneficiaryName: "Acme", amount: 1, currencyCode: "USD", requestedExecutionDate: "2026-03-20" }),
          headers: { "content-type": "application/json" }
        })
      ),
      getAdmin(),
      postAdmin(
        new Request("http://localhost/api/admin", {
          method: "POST",
          body: JSON.stringify({ recordType: "setting", category: "workspace", settingKey: "theme" }),
          headers: { "content-type": "application/json" }
        })
      )
    ]);

    await expect(paymentsGet.json()).resolves.toEqual({ payments: [{ id: "pay-1" }] });
    await expect(paymentsPost.json()).resolves.toEqual({ ok: true, payment: { id: "pay-2" } });
    await expect(adminGet.json()).resolves.toEqual({ roles: [{ id: "role-1" }] });
    await expect(adminPost.json()).resolves.toEqual({ ok: true, record: { id: "setting-1" } });
  });

  it("returns dashboard, query, and report payloads", async () => {
    serviceMocks.getDashboardsPayload.mockResolvedValue({ dashboards: [{ id: "dash-1" }] });
    serviceMocks.createDashboardRecord.mockResolvedValue({ ok: true, record: { id: "widget-1" } });
    serviceMocks.getQueryPayload.mockResolvedValue({ queries: [{ id: "query-1" }] });
    serviceMocks.createQueryRecord.mockResolvedValue({ ok: true, record: { id: "query-2" } });
    serviceMocks.getReportsPayload.mockResolvedValue({ reports: [{ id: "report-1" }] });
    serviceMocks.createReportRecord.mockResolvedValue({ ok: true, record: { id: "report-2" } });

    const [dashboardsGet, dashboardsPost, queryGet, queryPost, reportsGet, reportsPost] = await Promise.all([
      getDashboards(),
      postDashboards(
        new Request("http://localhost/api/dashboards", {
          method: "POST",
          body: JSON.stringify({ recordType: "widget", title: "Liquidity", widgetType: "kpi" }),
          headers: { "content-type": "application/json" }
        })
      ),
      getQuery(),
      postQuery(
        new Request("http://localhost/api/query", {
          method: "POST",
          body: JSON.stringify({ promptText: "What needs attention?" }),
          headers: { "content-type": "application/json" }
        })
      ),
      getReports(),
      postReports(
        new Request("http://localhost/api/reports", {
          method: "POST",
          body: JSON.stringify({ reportType: "audit" }),
          headers: { "content-type": "application/json" }
        })
      )
    ]);

    await expect(dashboardsGet.json()).resolves.toEqual({ dashboards: [{ id: "dash-1" }] });
    await expect(dashboardsPost.json()).resolves.toEqual({ ok: true, record: { id: "widget-1" } });
    await expect(queryGet.json()).resolves.toEqual({ queries: [{ id: "query-1" }] });
    await expect(queryPost.json()).resolves.toEqual({ ok: true, record: { id: "query-2" } });
    await expect(reportsGet.json()).resolves.toEqual({ reports: [{ id: "report-1" }] });
    await expect(reportsPost.json()).resolves.toEqual({ ok: true, record: { id: "report-2" } });
  });

  it("maps service authorization failures to HTTP 401", async () => {
    serviceMocks.getAccountsPayload.mockRejectedValue(new ApiError(401, "Unauthorized"));
    serviceMocks.getAdminPayload.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const [accountsResponse, adminResponse] = await Promise.all([getAccounts(), getAdmin()]);

    expect(accountsResponse.status).toBe(401);
    expect(adminResponse.status).toBe(401);
    await expect(accountsResponse.json()).resolves.toEqual({ error: "Unauthorized" });
    await expect(adminResponse.json()).resolves.toEqual({ error: "Unauthorized" });
  });
});
