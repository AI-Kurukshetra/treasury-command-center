import { expect, test, type Page } from "@playwright/test";

import { primaryNavigation } from "@/data/demo-data";
import { moduleDefinitionsBySlug } from "@/lib/modules/definitions";
import type { ModuleField } from "@/types/modules";
import type { ModuleSlug } from "@/lib/modules/validators";
import { signIn } from "../support/e2e";
import { moduleTestCases } from "../support/module-fixtures";

const workspaceHeadings: Record<string, string> = {
  "/modules": "Full treasury module surface",
  "/dashboard": "Global treasury overview",
  "/cash": "Live global cash view",
  "/forecasts": "Cash flow forecasting",
  "/payments": "Approval and release queue",
  "/risk": "Exposure and risk monitoring",
  "/reports": "Treasury reporting center",
  "/integrations": "Connector health",
  "/admin": "Platform controls"
};

test.describe.configure({ mode: "serial" });
test.setTimeout(180000);

test("authenticated user can navigate the primary treasury workflows and sign out", async ({
  page
}) => {
  await signIn(page);
  const sidebar = page.locator("aside");

  for (const item of primaryNavigation) {
    await sidebar.getByRole("link", { name: new RegExp(`^${escapeRegExp(item.title)}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(item.href)}$`));
    await expect(page.getByRole("heading", { name: workspaceHeadings[item.href] })).toBeVisible();
  }

  await sidebar.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/auth\/sign-in/);
  await expect(page.getByRole("heading", { name: "Sign in to the workspace" })).toBeVisible();

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/auth\/sign-in/);
});

test("authenticated user can create records through every module UI", async ({ page }) => {
  await signIn(page);

  for (const moduleCase of moduleTestCases) {
    await page.goto(moduleCase.route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: moduleCase.title })).toBeVisible();

    const payload = moduleCase.payload();
    await fillModuleForm(page, moduleCase.slug, payload);
    await page.getByRole("button", { name: "Create record" }).click();

    await expect(page.getByText(/^Record created\./)).toBeVisible();
    await expect(page.getByRole("heading", { name: moduleCase.title })).toBeVisible();
  }
});

async function fillModuleForm(page: Page, slug: ModuleSlug, payload: Record<string, unknown>) {
  const definition = moduleDefinitionsBySlug[slug];

  for (const field of definition.fields) {
    const value = payload[field.name];
    await fillField(page, field, value);
  }
}

async function fillField(page: Page, field: ModuleField, value: unknown) {
  if (value === undefined || value === null) {
    throw new Error(`Missing payload value for ${field.name}`);
  }

  const input = page.getByLabel(field.label);

  if (field.type === "select") {
    await input.selectOption(String(value));
    return;
  }

  await input.fill(String(value));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
