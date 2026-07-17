import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright smoke config (STANDARDS §12, DEFINITION OF DONE §14).
 *
 * Exercises the primary deterministic flow (the branch simulator) on the
 * mandated local port 3105, in a desktop and a mobile viewport, plus a keyboard
 * pass. No AI keys are required — the simulator is fully offline. Both projects
 * use Chromium so a single browser download is enough for CI.
 */

const PORT = 3105;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    // Runs the production build (STANDARDS: build must pass). Build separately
    // first (`pnpm build`), then this serves it on the mandated port.
    command: `pnpm exec next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
