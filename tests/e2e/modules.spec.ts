import { expect, test, type Page } from "@playwright/test";

import { signIn } from "../support/e2e";
import { moduleTestCases } from "../support/module-fixtures";

test.describe.configure({ mode: "serial" });
test.setTimeout(120000);

async function apiGet(page: Page, path: string) {
  return page.evaluate(async (requestPath: string) => {
    const response = await fetch(requestPath, {
      headers: {
        Accept: "application/json"
      }
    });

    return {
      status: response.status,
      body: await response.json()
    };
  }, path);
}

async function apiPost(page: Page, path: string, payload: Record<string, unknown>) {
  return page.evaluate(
    async ({ requestPath, requestBody }: { requestPath: string; requestBody: Record<string, unknown> }) => {
      const response = await fetch(requestPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      return {
        status: response.status,
        body: await response.json()
      };
    },
    { requestPath: path, requestBody: payload }
  );
}

test("module catalog and detail pages render for all documented modules", async ({ page }) => {
  await signIn(page);
  await page.goto("/modules", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Full treasury module surface" })).toBeVisible();
  await expect(page.getByText("18 modules")).toBeVisible();

  for (const moduleCase of moduleTestCases) {
    await page.goto(`/modules/${moduleCase.slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: moduleCase.title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create module record" })).toBeVisible();
  }
});

test("all module APIs accept valid create payloads", async ({ page }) => {
  await signIn(page);

  for (const moduleCase of moduleTestCases) {
    const before = await apiGet(page, `/api/modules/${moduleCase.slug}`);
    expect(before.status).toBe(200);

    const response = await apiPost(page, `/api/modules/${moduleCase.slug}/records`, moduleCase.payload());
    expect(response.status, moduleCase.slug).toBe(200);
    expect(response.body.ok, moduleCase.slug).toBe(true);

    const after = await apiGet(page, `/api/modules/${moduleCase.slug}`);
    expect(after.status).toBe(200);
    expect(after.body.module.recordCount, moduleCase.slug).toBeGreaterThanOrEqual(
      before.body.module.recordCount + 1
    );
  }
});

test("all module APIs reject invalid payloads", async ({ page }) => {
  await signIn(page);

  for (const moduleCase of moduleTestCases) {
    const response = await apiPost(page, `/api/modules/${moduleCase.slug}/records`, {});
    expect(response.status, moduleCase.slug).toBe(400);
    expect(
      response.body.error === "Validation failed" ||
        typeof response.body.error === "string",
      moduleCase.slug
    ).toBeTruthy();
  }
});

test("identity module create flow works in the UI", async ({ page }) => {
  await signIn(page);
  await page.goto("/modules/identity-access", { waitUntil: "domcontentloaded" });

  const roleName = `Regional Treasurer ${Date.now()}`;
  await page.getByLabel("Role name").fill(roleName);
  await page.getByLabel("Description").fill("Regional operating access for treasury approvals.");
  await page.getByRole("button", { name: "Create record" }).click();

  await expect(page.getByText("Record created.")).toBeVisible();
  await expect(page.getByText(roleName)).toBeVisible();
});
