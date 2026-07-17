import { test, expect } from "@playwright/test";
import path from "node:path";

/**
 * Primary-flow smoke test: the branch simulator (/tool), the deterministic core
 * of MK GitFlow. Covers running commands, the screen-reader command log, a
 * keyboard pass, and a mobile-viewport layout check. No AI keys required.
 */

const SCREENSHOT_DIR = path.join(process.cwd(), "public", "screenshots");

test.describe("branch simulator — primary deterministic flow", () => {
  test("runs commands and updates the command log", async ({ page }) => {
    await page.goto("/tool");

    await expect(page.getByRole("heading", { level: 1, name: /every command does/i })).toBeVisible();

    const log = page.getByRole("region", { name: "Command log" });
    await expect(log).toContainText(/STEP 0 \/ 0/);

    const input = page.locator("#sim-command");
    await input.fill('commit "first commit"');
    await page.getByRole("button", { name: "Run" }).click();

    await expect(log).toContainText(/STEP 1 \/ 1/);
    await expect(log).toContainText(/first commit/i);
    // After the first commit the graph is exposed as an accessible image,
    // never SVG-only (the command log is the parallel text representation).
    await expect(page.getByRole("img").first()).toBeVisible();

    // A branch operation, still fully in-memory.
    await input.fill("checkout -b feature/login");
    await page.getByRole("button", { name: "Run" }).click();
    await expect(log).toContainText(/STEP 2 \/ 2/);
  });

  test("invalid input shows an inline error, never a dead end", async ({ page }) => {
    await page.goto("/tool");
    await page.locator("#sim-command").fill("frobnicate the repo");
    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.locator("#sim-error")).toBeVisible();
  });

  test("keyboard: skip link is the first stop and Enter submits a command", async ({ page }) => {
    await page.goto("/tool");

    // The skip link must be the first focusable element (WCAG bypass block).
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to main content/i })).toBeFocused();

    // Drive the command entirely from the keyboard.
    const input = page.locator("#sim-command");
    await input.focus();
    await page.keyboard.type('commit "typed with the keyboard"');
    await page.keyboard.press("Enter");

    const log = page.getByRole("region", { name: "Command log" });
    await expect(log).toContainText(/STEP 1 \/ 1/);
    await expect(log).toContainText(/typed with the keyboard/i);
  });

  test("captures README screenshots (desktop only)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one capture is enough");

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "home.png"), fullPage: false });

    await page.goto("/tool");
    const input = page.locator("#sim-command");
    for (const command of ['commit "initial commit"', "checkout -b feature/login", 'commit "add login form"']) {
      await input.fill(command);
      await page.getByRole("button", { name: "Run" }).click();
    }
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "simulator.png"), fullPage: false });
  });
});

test.describe("mobile viewport", () => {
  test("simulator is usable with no horizontal overflow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "mobile-only check");

    await page.goto("/tool");
    await expect(page.locator("#sim-command")).toBeVisible();

    // The page body must never scroll horizontally (DESIGN_SYSTEM §13).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.locator("#sim-command").fill('commit "mobile commit"');
    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.getByRole("region", { name: "Command log" })).toContainText(/mobile commit/i);
  });
});
