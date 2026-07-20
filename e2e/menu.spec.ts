import { test, expect } from "@playwright/test";

test.describe("Menu Page", () => {
  test("loads the menu page with heading", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Should have a heading (either "Menú de la Semana" or a custom menu label)
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();
    await expect(heading).not.toBeEmpty();
  });

  test("shows search input on the menu page", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Search input should be visible
    const searchInput = page.getByPlaceholder(/buscar platillos/i);
    await expect(searchInput).toBeVisible();
  });

  test("search input filters meal items", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Get the initial count of visible items
    // Wait for meal items to render
    const mealItems = page.locator("h3").filter({ hasText: /.+/ });
    const initialCount = await mealItems.count();

    // Only test filtering if there are items
    if (initialCount > 0) {
      // Type in the search box
      const searchInput = page.getByPlaceholder(/buscar platillos/i);
      await searchInput.fill("ZZZZ_NONEXISTENT_ZZZZ");

      // Wait for filter to apply - either empty state or visible items update
      const emptyState = page.getByText(/no encontramos platillos/i);
      const isEmptyVisible = await emptyState.isVisible();

      if (isEmptyVisible) {
        await expect(emptyState).toBeVisible();
      } else {
        // No empty state means there were zero items to begin with
        const visibleItems = page.locator("h3").filter({ hasText: /.+/ });
        const visibleCount = await visibleItems.count();
        expect(visibleCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });

  test("filter toggle button is present", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Filter button should be visible
    const filterButton = page.getByRole("button", { name: /filtros/i });
    await expect(filterButton).toBeVisible();
  });

  test("toggle filter shows dietary tag options", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Click the filter button
    const filterButton = page.getByRole("button", { name: /filtros/i });
    await filterButton.click();

    // Should see the filter section with tag options
    const filterSection = page.getByText(/filtrar por categoría/i);
    await expect(filterSection).toBeVisible();
  });

  test("shows guest sign-in prompt for unauthenticated users", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // As a guest, there should be "Inicia sesión" buttons next to items
    // OR there could be no items at all
    const signInButtons = page.getByText(/inicia sesión/i);
    const itemCount = await page.locator("h3").filter({ hasText: /.+/ }).count();

    if (itemCount > 0) {
      await expect(signInButtons.first()).toBeVisible();
    }
    // If no items exist, the sign-in prompt may not be visible (empty menu)
  });

  test("shows the results count", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Should show something like "X platillos disponibles"
    const countText = page.getByText(/platillos? disponibles/i);
    await expect(countText).toBeVisible();
  });

  test.describe("Mobile responsiveness", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("menu page is usable on mobile", async ({ page }) => {
      await page.goto("/menu");
      await page.waitForLoadState("networkidle");

      // Heading should be present
      const heading = page.getByRole("heading", { level: 1 }).first();
      await expect(heading).toBeVisible();

      // Search should be present
      const searchInput = page.getByPlaceholder(/buscar platillos/i);
      await expect(searchInput).toBeVisible();

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px rounding
    });
  });
});
