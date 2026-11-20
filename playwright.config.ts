import { defineConfig, devices } from "@playwright/test";

const PORT = 4322;

/**
 * E2E tests run against the production build served by `astro preview`.
 * Run `pnpm build` first (the `pnpm ci` script does this for you).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // --ignore-lock: always a one-off foreground server. Without it, Astro 7
    // backgrounds the preview when it detects an AI agent, and Playwright
    // sees the process exit early.
    command: `pnpm preview --host 127.0.0.1 --port ${PORT} --ignore-lock`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
