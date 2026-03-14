import { expect, test } from "@playwright/test";

test("landing page renders and sign-in page is reachable", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "Replace spreadsheet treasury with a live command center." })
  ).toBeVisible();

  await page.getByRole("link", { name: "Enter the workspace" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await page.waitForLoadState("domcontentloaded");
  await expect(
    page.getByRole("heading", { level: 1, name: /sign in to the workspace/i })
  ).toBeVisible();
});
