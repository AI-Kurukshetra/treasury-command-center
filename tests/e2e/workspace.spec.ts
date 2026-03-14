import { expect, test } from "@playwright/test";

import { signIn } from "../support/e2e";
import { srsCoverage } from "../support/srs-coverage";

const workspacePages = [
  { route: "/dashboard", heading: "Global treasury overview" },
  { route: "/cash", heading: "Live global cash view" },
  { route: "/forecasts", heading: "Cash flow forecasting" },
  { route: "/payments", heading: "Approval and release queue" },
  { route: "/risk", heading: "Exposure and risk monitoring" },
  { route: "/reports", heading: "Treasury reporting center" },
  { route: "/integrations", heading: "Connector health" },
  { route: "/admin", heading: "Platform controls" }
];

test.describe.configure({ mode: "serial" });
test.setTimeout(120000);

test("workspace pages render all main treasury surfaces", async ({ page }) => {
  await signIn(page);

  for (const entry of workspacePages) {
    await page.goto(entry.route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: entry.heading })).toBeVisible();
  }
});

test("every SRS requirement maps to a reachable UI route", async ({ page }) => {
  await signIn(page);

  const uniqueRoutes = [...new Set(srsCoverage.map((entry) => entry.workspaceRoute))];

  for (const route of uniqueRoutes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBeLessThan(400);
    await expect(page.locator("main").first()).toBeVisible();
  }
});
