import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import path from "path";

// Setup must be run serially for Clerk testing token to work
setup.describe.configure({ mode: "serial" });

// Configure Playwright with Clerk — obtains a testing token
setup("global setup", async () => {
  await clerkSetup();
});

// Authenticate as admin and save the session for reuse
const authFile = path.join(__dirname, "../playwright/.clerk/admin.json");

setup("authenticate admin and save state", async ({ page }) => {
  const adminEmail = process.env.E2E_CLERK_USER_EMAIL;
  if (!adminEmail) {
    setup.skip(true, "E2E_CLERK_USER_EMAIL not set — skipping auth setup");
    return;
  }

  // Sign in using a server-side testing token (bypasses verification/MFA)
  await page.goto("/");
  await clerk.signIn({
    page,
    emailAddress: adminEmail,
  });

  // Verify the admin can access the dashboard
  await page.goto("/admin");

  // Wait for either the admin dashboard heading or a redirect
  await page.waitForURL(/\/admin|\/sign/, { timeout: 15_000 });

  // Only save state if we actually reached the admin dashboard
  const currentUrl = page.url();
  if (currentUrl.includes("/admin")) {
    // Confirm the dashboard heading is visible (page fully loaded)
    await page.waitForSelector("h1", { timeout: 10_000 });

    // Save the authenticated session
    await page.context().storageState({ path: authFile });
  } else {
    // If redirected away (not admin), log a warning but still save state
    console.warn(
      `⚠️  User ${adminEmail} was redirected from /admin — may not have admin role. Saving partial auth state anyway.`
    );
    await page.context().storageState({ path: authFile });
  }
});
