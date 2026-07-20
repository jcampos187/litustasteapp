import { test, expect } from "@playwright/test";

test.describe("Guest Auth Redirects", () => {
  test("guest is redirected to sign-in when accessing /cart", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Guest should be redirected to Clerk's sign-in page
    // The URL should either contain /auth/sign-in or Clerk's hosted sign-in
    await expect(page).toHaveURL(/sign/i);
  });

  test("guest is redirected to sign-in when accessing /account/profile", async ({ page }) => {
    await page.goto("/account/profile");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/sign/i);
  });

  test("guest is redirected to sign-in when accessing /account/orders", async ({ page }) => {
    await page.goto("/account/orders");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/sign/i);
  });

  test("guest is redirected to sign-in when accessing /admin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/sign/i);
  });

  test("guest is redirected to sign-in when accessing /order/confirmation", async ({ page }) => {
    await page.goto("/order/confirmation?orderId=test-123");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/sign/i);
  });

  test("guest can still access public /menu page", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Should remain on the menu page, not redirected
    await expect(page).toHaveURL(/\/menu/);
  });

  test("guest can still access public landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Should remain on landing page, not redirected
    await expect(page).toHaveURL(/\//);
    await expect(page).not.toHaveURL(/sign/);
  });

  test.describe("Mobile responsiveness", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("guest is redirected to sign-in on mobile /cart", async ({ page }) => {
      await page.goto("/cart");
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL(/sign/i);
    });
  });
});
