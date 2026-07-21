import { test, expect } from "@playwright/test";

test.describe("Order Flow — Cart", () => {
  test("cart page redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/sign/i);
  });
});

test.describe("Order Flow — Menu Add-to-Cart", () => {
  test("menu page shows sign-in prompt for guest users when items exist", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Menu page is public
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();

    // Check if there are menu items
    const mealItems = page.locator("h3").filter({ hasText: /.+/ });
    const itemCount = await mealItems.count();

    if (itemCount > 0) {
      // Guest users should see "Inicia sesión" links next to items
      const signInLink = page.getByRole("link", { name: /inicia sesión/i }).first();
      await expect(signInLink).toBeVisible();

      // Clicking should navigate to sign-in
      await signInLink.click();
      await expect(page).toHaveURL(/sign/i);
    }
  });

  test("menu page has filters toggle and search input", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Search input
    const searchInput = page.getByPlaceholder(/buscar platillos/i);
    await expect(searchInput).toBeVisible();

    // Filter toggle button
    const filterButton = page.getByRole("button", { name: /filtros/i });
    await expect(filterButton).toBeVisible();

    // Open filters
    await filterButton.click();
    await expect(page.getByText(/filtrar por categoría/i)).toBeVisible();

    // Close filters
    await filterButton.click();
    await expect(page.getByText(/filtrar por categoría/i)).not.toBeVisible();
  });

  test("search filters items to empty state with non-matching query", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/buscar platillos/i);
    await searchInput.fill("ZZZZ_NONEXISTENT_ZZZZ");

    // Should show empty state
    await expect(page.getByText(/no encontramos platillos/i)).toBeVisible({ timeout: 5000 });

    // Clear search
    await searchInput.fill("");

    // Results count should reappear
    await expect(page.getByText(/platillos? disponibles/i)).toBeVisible({ timeout: 5000 });
  });

  test("confirming order requires authentication", async ({ page }) => {
    // Cart requires authentication — guest should be redirected to sign-in
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sign/i);
  });
});

test.describe("Order Flow — Confirmation", () => {
  test("order confirmation page redirects guests to sign-in", async ({ page }) => {
    await page.goto("/order/confirmation?orderId=test-123");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/sign/i);
  });
});

test.describe("Order Flow — Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("menu page is functional on mobile", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();

    const searchInput = page.getByPlaceholder(/buscar platillos/i);
    await expect(searchInput).toBeVisible();

    // Test that search input is functional on mobile
    await searchInput.fill("test");
    await expect(searchInput).toHaveValue("test");
    await searchInput.fill("");
  });

  test("cart page redirects guests to sign-in on mobile", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/sign/i);
  });
});
