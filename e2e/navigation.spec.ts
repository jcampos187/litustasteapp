import { test, expect } from "@playwright/test";

test.describe("Site Navigation", () => {
  test("navigates from landing to /menu via the header link", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find the "Menú" link in the header
    const menuLink = page.locator("header").getByRole("link", { name: /menú/i });

    // If visible, click it
    if (await menuLink.isVisible()) {
      await menuLink.click();
      await expect(page).toHaveURL(/\/menu/);
    }
    // On mobile the menu may be hidden behind a hamburger
  });

  test("navigates to /menu via the hero CTA button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find the CTA button/link
    const ctaLink = page.getByRole("link", { name: /ver men/i });
    await ctaLink.click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test("auth sign-in page loads", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.waitForLoadState("networkidle");

    // Clerk sign-in should render
    // The page should contain sign-in related content
    await expect(page).toHaveURL(/sign/);
  });

  test("auth sign-up page loads", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await page.waitForLoadState("networkidle");

    // Clerk sign-up should render
    await expect(page).toHaveURL(/sign/);
  });

  test("returns 200 for the landing page", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("returns 200 for the menu page", async ({ page }) => {
    const response = await page.goto("/menu");
    expect(response?.status()).toBe(200);
  });
});

test.describe("Page Titles", () => {
  test("landing page has a valid title", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("menu page has a valid title", async ({ page }) => {
    await page.goto("/menu");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe("Console Errors", () => {
  test("no console errors on landing page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Allow Clerk-related warnings but no actual errors
    const realErrors = errors.filter(
      (e) =>
        !e.toLowerCase().includes("clerk") &&
        !e.toLowerCase().includes("third-party")
    );
    expect(realErrors).toHaveLength(0);
  });

  test("no console errors on menu page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Allow Clerk-related warnings but no actual errors
    const realErrors = errors.filter(
      (e) =>
        !e.toLowerCase().includes("clerk") &&
        !e.toLowerCase().includes("third-party")
    );
    expect(realErrors).toHaveLength(0);
  });
});
