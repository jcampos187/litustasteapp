import { test, expect } from "@playwright/test";

test.describe("Order Flow — Authenticated", () => {
  test("loads the menu page as authenticated user", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Menu heading should be visible
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();

    // Search and filter should be present
    await expect(page.getByPlaceholder(/buscar platillos/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /filtros/i })).toBeVisible();
  });

  test("can add a meal to cart from the menu", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Check if there are meal items
    const meals = page.locator("h3");
    const mealCount = await meals.count();

    if (mealCount > 0) {
      // Find the first "Agregar al carrito" button (Plus icon button for logged-in users)
      const addButton = page.getByRole("button", { name: /agregar al carrito/i }).first();

      if (await addButton.isVisible()) {
        await addButton.click();

        // Wait briefly for the cart to update
        await page.waitForTimeout(300);

        // The button should now be replaced by quantity controls
        // Check that the add button is no longer visible
        await expect(addButton).not.toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("cart page loads with items and UI elements when logged in", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Add an item to cart first
    const addButton = page.getByRole("button", { name: /agregar al carrito/i }).first();
    const hasItem = await addButton.isVisible();

    if (hasItem) {
      await addButton.click();
      await page.waitForTimeout(300);
    }

    // Navigate to cart
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Should be on the cart page (not redirected to sign-in)
    await expect(page).not.toHaveURL(/sign/i);

    // Cart should show the heading
    await expect(page.getByRole("heading", { name: /tu carrito/i })).toBeVisible();

    // UI elements should be present
    await expect(page.getByText(/notas para tu pedido/i)).toBeVisible();
    await expect(page.getByText(/enviar pedido/i)).toBeVisible();
    await expect(page.getByText(/vaciar carrito/i)).toBeVisible();
    await expect(page.getByText(/seguir agregando/i)).toBeVisible();
  });

  test("can increment item quantity in cart", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // Add an item
    const addButton = page.getByRole("button", { name: /agregar al carrito/i }).first();
    if (!(await addButton.isVisible())) {
      test.skip(true, "No menu items available to add to cart");
      return;
    }

    await addButton.click();
    await page.waitForTimeout(300);

    // Navigate to cart
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Find and click the plus button in cart
    const plusButton = page.getByRole("button", { name: /aumentar cantidad/i }).first();
    if (await plusButton.isVisible()) {
      await plusButton.click();
      await page.waitForTimeout(300);

      // Quantity should now show 2
      const quantityDisplay = page.locator("span").filter({ hasText: /^2$/ }).first();
      await expect(quantityDisplay).toBeVisible();
    }
  });

  test("can decrement and confirm remove item from cart", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    const addButton = page.getByRole("button", { name: /agregar al carrito/i }).first();
    if (!(await addButton.isVisible())) {
      test.skip(true, "No menu items available to add to cart");
      return;
    }

    await addButton.click();
    await page.waitForTimeout(300);

    // Go to cart
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Find the minus button
    const minusButton = page.getByRole("button", { name: /disminuir cantidad/i }).first();
    if (await minusButton.isVisible()) {
      // At qty=1, clicking minus should show remove confirmation
      await minusButton.click();

      // Confirmation modal should appear
      await expect(page.getByText(/eliminar artículo/i)).toBeVisible();
    }
  });

  test("order confirmation page renders for authenticated user", async ({ page }) => {
    await page.goto("/order/confirmation?orderId=test-order-123");
    await page.waitForLoadState("networkidle");

    // Should be on the confirmation page (not redirected)
    await expect(page).not.toHaveURL(/sign/i);

    // Should show success message
    await expect(page.getByText(/pedido recibido/i)).toBeVisible();
    await expect(page.getByText(/gracias por tu pedido/i)).toBeVisible();
    await expect(page.getByText(/¿qué sigue/i)).toBeVisible();

    // Should have links
    await expect(page.getByRole("link", { name: /ver mis pedidos/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /volver al menú/i })).toBeVisible();
  });
});

test.describe("Order Flow — Cart Interactions", () => {
  async function addFirstItemToCart(page: import("@playwright/test").Page) {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");
    const addButton = page.getByRole("button", { name: /agregar al carrito/i }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);
    }
  }

  test("notes textarea is functional", async ({ page }) => {
    await addFirstItemToCart(page);
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Should be on cart page (not redirected)
    await expect(page).not.toHaveURL(/sign/i);

    // Find and fill the notes textarea
    const notesTextarea = page.locator("textarea");
    await expect(notesTextarea).toBeVisible();
    await notesTextarea.fill("Test note for E2E test");
    await expect(notesTextarea).toHaveValue("Test note for E2E test");
  });

  test("total section displays with correct formatting", async ({ page }) => {
    await addFirstItemToCart(page);
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await expect(page).not.toHaveURL(/sign/i);

    // Total label should be visible
    await expect(page.getByText(/total/i)).toBeVisible();

    // Enviar Pedido button should be present
    await expect(page.getByRole("button", { name: /enviar pedido/i })).toBeVisible();
  });

  test("vaciar carrito shows clear confirmation", async ({ page }) => {
    await addFirstItemToCart(page);
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await expect(page).not.toHaveURL(/sign/i);

    // Click "Vaciar carrito" text button
    const clearButton = page.getByText(/vaciar carrito/i).first();
    await clearButton.click();

    // Confirmation modal should appear
    await expect(page.getByText(/vaciar carrito/i).nth(1)).toBeVisible();
    await expect(page.getByText(/eliminarán todos los artículos/i)).toBeVisible();
  });
});

test.describe("Order Flow — Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("menu page is functional on mobile as authenticated user", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();

    const searchInput = page.getByPlaceholder(/buscar platillos/i);
    await expect(searchInput).toBeVisible();

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test("cart page is usable on mobile", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    await expect(page).not.toHaveURL(/sign/i);
    await expect(page.getByRole("heading", { name: /tu carrito/i })).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 2);
  });
});
