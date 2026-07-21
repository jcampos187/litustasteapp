import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Read environment variables from .env.local if available.
 * See https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const authFile = path.join(__dirname, "playwright/.clerk/admin.json");

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* Maximum time one test can run for */
  timeout: 30_000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 10_000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "github" : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Capture screenshot on failure */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    // ─── Global setup (runs first, before all projects) ─────────
    {
      name: "global-setup",
      testMatch: /global\.setup\.ts/,
    },

    // ─── Guest / public page tests (no auth needed) ──────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["**/admin-authenticated.spec.ts", "**/order-flow-authenticated.spec.ts", "**/global.setup.ts"],
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: ["**/admin-authenticated.spec.ts", "**/order-flow-authenticated.spec.ts", "**/global.setup.ts"],
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: ["**/admin-authenticated.spec.ts", "**/order-flow-authenticated.spec.ts", "**/global.setup.ts"],
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: ["**/admin-authenticated.spec.ts", "**/order-flow-authenticated.spec.ts", "**/global.setup.ts"],
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 14"] },
      testIgnore: ["**/admin-authenticated.spec.ts", "**/order-flow-authenticated.spec.ts", "**/global.setup.ts"],
    },

    // ─── Authenticated tests (logged-in session) ──────────
    {
      name: "admin-authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      testMatch: /(admin-authenticated|order-flow-authenticated)\.spec\.ts/,
      dependencies: ["global-setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI
      ? "npm run build && npm run start"
      : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
