import { expect, type Page } from "@playwright/test";

export async function signIn(page: Page) {
  await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill("treasurer@local.test");
  await page.getByLabel("Password").fill("Treasury123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Global treasury overview" })).toBeVisible();
}
