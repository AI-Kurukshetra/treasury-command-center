import { expect, test } from "@playwright/test";

test("landing page renders and sign-in page is reachable", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", {
      name: /Treasury software that looks and behaves like a control room/i
    })
  ).toBeVisible();

  await page.getByRole("link", { name: "Enter the workspace" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await page.waitForLoadState("domcontentloaded");
  await expect(
    page.getByRole("heading", { level: 1, name: /sign in to the workspace/i })
  ).toBeVisible();
});
