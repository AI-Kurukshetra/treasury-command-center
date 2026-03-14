import { beforeEach, describe, expect, it, vi } from "vitest";

import { moduleTestCases } from "../../support/module-fixtures";

const {
  getAppSessionMock,
  getModuleCatalogMock,
  getModuleDetailMock,
  createModuleRecordMock
} = vi.hoisted(() => ({
  getAppSessionMock: vi.fn(),
  getModuleCatalogMock: vi.fn(),
  getModuleDetailMock: vi.fn(),
  createModuleRecordMock: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  getAppSession: getAppSessionMock
}));

vi.mock("@/lib/modules/service", () => ({
  getModuleCatalog: getModuleCatalogMock,
  getModuleDetail: getModuleDetailMock,
  createModuleRecord: createModuleRecordMock
}));

import { GET as getModules } from "@/app/api/modules/route";
import { GET as getModuleDetail } from "@/app/api/modules/[slug]/route";
import { POST as postModuleRecord } from "@/app/api/modules/[slug]/records/route";

describe("module API routes", () => {
  beforeEach(() => {
    getAppSessionMock.mockResolvedValue({
      user: { id: "user-1", name: "Local", email: "treasurer@local.test", role: "Treasury Admin" },
      organization: { id: "org-1", name: "Atlas Treasury Group" }
    });
    getModuleCatalogMock.mockResolvedValue([{ slug: "identity-access" }]);
    getModuleDetailMock.mockImplementation(async (slug: string) => ({ slug }));
    createModuleRecordMock.mockResolvedValue({});
  });

  it("rejects unauthenticated module catalog requests", async () => {
    getAppSessionMock.mockResolvedValueOnce(null);

    const response = await getModules();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns the module catalog for authenticated requests", async () => {
    const response = await getModules();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ modules: [{ slug: "identity-access" }] });
  });

  it("returns 404 for unknown module detail requests", async () => {
    const response = await getModuleDetail(new Request("http://localhost/api/modules/nope"), {
      params: Promise.resolve({ slug: "nope" })
    });

    expect(response.status).toBe(404);
  });

  it("returns module detail for every documented module slug", async () => {
    for (const testCase of moduleTestCases) {
      const response = await getModuleDetail(
        new Request(`http://localhost/api/modules/${testCase.slug}`),
        {
          params: Promise.resolve({ slug: testCase.slug })
        }
      );

      expect(response.status, testCase.slug).toBe(200);
      await expect(response.json()).resolves.toEqual({ module: { slug: testCase.slug } });
    }
  });

  it("rejects invalid payloads for every module before service execution", async () => {
    for (const testCase of moduleTestCases) {
      const response = await postModuleRecord(
        new Request(`http://localhost/api/modules/${testCase.slug}/records`, {
          method: "POST",
          body: JSON.stringify({})
        }),
        {
          params: Promise.resolve({ slug: testCase.slug })
        }
      );

      expect(response.status, testCase.slug).toBe(400);
    }

    expect(createModuleRecordMock).not.toHaveBeenCalled();
  });

  it("accepts valid payloads for every module", async () => {
    for (const testCase of moduleTestCases) {
      const response = await postModuleRecord(
        new Request(`http://localhost/api/modules/${testCase.slug}/records`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(testCase.payload())
        }),
        {
          params: Promise.resolve({ slug: testCase.slug })
        }
      );

      expect(response.status, testCase.slug).toBe(200);
      await expect(response.json()).resolves.toEqual({ ok: true });
    }

    expect(createModuleRecordMock).toHaveBeenCalledTimes(moduleTestCases.length);
  });

  it("surfaces service errors as bad requests", async () => {
    createModuleRecordMock.mockResolvedValueOnce({ error: { message: "database rejected payload" } });

    const response = await postModuleRecord(
      new Request("http://localhost/api/modules/identity-access/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(moduleTestCases[0].payload())
      }),
      {
        params: Promise.resolve({ slug: "identity-access" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "database rejected payload" });
  });
});
