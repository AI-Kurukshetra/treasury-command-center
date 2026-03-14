import { rename } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const baseUrl = "https://treasury-command-center.vercel.app";
const outputDir = path.resolve("artifacts/demo");
const outputVideo = path.join(outputDir, "treasury-command-center-demo.webm");

async function ensureDir() {
  await mkdir(outputDir, { recursive: true });
}

async function showBanner(page, text) {
  await page.evaluate((message) => {
    const id = "__codex_demo_banner";
    let banner = document.getElementById(id);
    if (!banner) {
      banner = document.createElement("div");
      banner.id = id;
      banner.setAttribute(
        "style",
        [
          "position:fixed",
          "top:16px",
          "left:50%",
          "transform:translateX(-50%)",
          "z-index:2147483647",
          "padding:12px 18px",
          "border-radius:999px",
          "background:rgba(10,16,30,0.88)",
          "color:#f8fafc",
          "font:600 14px/1.4 ui-sans-serif,system-ui,sans-serif",
          "box-shadow:0 14px 40px rgba(15,23,42,0.28)",
          "letter-spacing:0.02em"
        ].join(";")
      );
      document.body.appendChild(banner);
    }
    banner.textContent = message;
  }, text);
  await page.waitForTimeout(700);
}

async function highlight(locator, label) {
  const page = locator.page();
  await locator.scrollIntoViewIfNeeded();
  await showBanner(page, label);
  await locator.evaluate((element) => {
    const id = "__codex_demo_highlight";
    let overlay = document.getElementById(id);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = id;
      overlay.setAttribute(
        "style",
        [
          "position:fixed",
          "z-index:2147483646",
          "pointer-events:none",
          "border:3px solid #f97316",
          "border-radius:20px",
          "box-shadow:0 0 0 6px rgba(249,115,22,0.18)",
          "transition:all 180ms ease"
        ].join(";")
      );
      document.body.appendChild(overlay);
    }
    const rect = element.getBoundingClientRect();
    overlay.style.left = `${rect.left - 6}px`;
    overlay.style.top = `${rect.top - 6}px`;
    overlay.style.width = `${rect.width + 12}px`;
    overlay.style.height = `${rect.height + 12}px`;
  });
  await page.waitForTimeout(500);
}

async function click(locator, label) {
  await highlight(locator, label);
  await locator.click();
  await locator.page().waitForTimeout(900);
}

async function fill(locator, value, label) {
  await highlight(locator, label);
  await locator.fill(value);
  await locator.page().waitForTimeout(450);
}

async function main() {
  await ensureDir();

  const browser = await chromium.launch({
    headless: true,
    slowMo: 150
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1440, height: 900 }
    }
  });
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await showBanner(page, "Treasury Command Center production walkthrough");
  await page.waitForTimeout(1200);

  await click(page.getByRole("link", { name: /explore executive dashboard/i }), "Open the live treasury workspace");
  await fill(page.getByLabel("Email"), "treasurer@local.test", "Enter the live demo email");
  await fill(page.getByLabel("Password"), "Treasury123!", "Enter the live demo password");
  await click(page.getByRole("button", { name: /sign in/i }), "Sign in to the production workspace");
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await page.waitForLoadState("networkidle");

  await click(page.getByRole("link", { name: /^Dashboard/ }), "Return to the executive dashboard");
  await fill(page.getByPlaceholder("Daily payments posture"), "Daily operating posture", "Prepare a saved treasury query title");
  await fill(
    page.getByPlaceholder("What requires attention across payments, reports, and integrations today?"),
    "What requires attention across liquidity, funding, and approvals today?",
    "Ask a natural-language treasury question"
  );
  await click(page.getByRole("button", { name: /run query/i }), "Run the treasury query");
  await fill(page.getByPlaceholder("Treasurer iPhone"), "Video Demo iPhone", "Register a mobile approval device");
  await fill(page.getByPlaceholder("iOS"), "iOS", "Set the mobile device platform");
  await click(page.getByRole("button", { name: /register device/i }), "Register mobile device posture");

  await click(page.getByRole("link", { name: /^Cash/ }), "Open the live cash operations view");
  await click(page.getByRole("button", { name: /generate snapshot/i }), "Generate a new cash snapshot");

  await click(page.getByRole("link", { name: /^Forecasts/ }), "Open the forecasting workspace");
  await fill(page.getByLabel("Forecast name"), "Video walkthrough forecast", "Name a new forecast run");
  await click(page.getByRole("button", { name: /generate forecast/i }), "Generate a new forecast");

  await click(page.getByRole("link", { name: /^Payments/ }), "Open the payment command queue");
  await fill(page.getByLabel("Beneficiary"), "Video Demo Supplier", "Enter a demo payment beneficiary");
  await fill(page.getByLabel("Amount"), "25000", "Enter a payment amount");
  await click(page.getByRole("button", { name: /create payment/i }), "Initiate a payment into the approval engine");

  await click(page.getByRole("link", { name: /^Risk/ }), "Open the risk and capital workspace");
  await fill(page.getByLabel("Provider"), "Video Feed", "Enter a market-data provider");
  await fill(page.getByLabel("Instrument type"), "fx_spot", "Enter the market-data instrument type");
  await fill(page.getByLabel("Symbol"), "USD/INR", "Enter the market-data symbol");
  await fill(page.getByLabel("Value"), "82.5", "Enter the market-data value");
  await click(page.getByRole("button", { name: /publish data point/i }), "Publish market data into treasury risk");

  await click(page.getByRole("link", { name: /^Reports/ }), "Open the treasury reporting center");
  await click(page.getByRole("button", { name: /generate report/i }), "Generate a treasury report");

  await click(page.getByRole("link", { name: /^Integrations/ }), "Open the integration command center");
  const syncButtons = page.getByRole("button", { name: /sync /i });
  if (await syncButtons.count()) {
    await click(syncButtons.first(), "Trigger a connector sync");
  }

  await click(page.getByRole("link", { name: /^Admin/ }), "Open platform controls");
  await fill(page.getByPlaceholder("workspace"), "workspace", "Set a platform setting category");
  await fill(page.getByPlaceholder("home_layout"), "demo_mode_banner", "Create a platform setting key");
  await click(page.getByRole("button", { name: /create setting/i }), "Store an administrative platform setting");

  await click(page.getByRole("link", { name: /^Modules/ }), "Open the platform module catalog");
  await click(page.getByRole("link", { name: /Identity And Access/i }), "Inspect a detailed platform module");
  await showBanner(page, "Walkthrough complete");
  await page.waitForTimeout(1800);

  const video = await page.video().path();
  await context.close();
  await browser.close();
  await rename(video, outputVideo);

  console.log(outputVideo);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
