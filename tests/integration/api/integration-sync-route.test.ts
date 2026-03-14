import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

const { runIntegrationSyncMock } = vi.hoisted(() => ({
  runIntegrationSyncMock: vi.fn()
}));

vi.mock("@/lib/integrations/providers", () => ({
  runIntegrationSync: runIntegrationSyncMock
}));

import { POST } from "@/app/api/integrations/sync/route";

describe("integration sync route", () => {
  beforeEach(() => {
    runIntegrationSyncMock.mockReset();
  });

  it("returns provider sync results", async () => {
    runIntegrationSyncMock.mockResolvedValue({
      ok: true,
      syncRunId: "sync-1",
      recordsProcessed: 3,
      summary: "Imported transactions."
    });

    const response = await POST(
      new Request("http://localhost/api/integrations/sync", {
        method: "POST",
        body: JSON.stringify({
          integrationConnectionId: "conn-1",
          syncType: "bank_sync"
        }),
        headers: { "content-type": "application/json" }
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      syncRunId: "sync-1",
      recordsProcessed: 3
    });
  });

  it("maps provider authorization failures", async () => {
    runIntegrationSyncMock.mockRejectedValue(new ApiError(401, "Unauthorized"));

    const response = await POST(
      new Request("http://localhost/api/integrations/sync", {
        method: "POST",
        body: JSON.stringify({
          integrationConnectionId: "conn-1",
          syncType: "bank_sync"
        }),
        headers: { "content-type": "application/json" }
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });
});
