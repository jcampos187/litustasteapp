import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads the landing page with hero content", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Hero section should have the main heading
    await expect(
      page.getByRole("heading", { name: /comida preparada/i, level: 1 })
    ).toBeVisible();

    // Should have the premium badge with fresh food message
    await expect(
      page.getByText(/comida preparada fresca/i)
    ).toBeVisible();
  });

  test("hero section has a CTA button to the menu", async ({ page }) => {
    await page.goto("/");

    // The main CTA should link to /menu
    const menuCta = page.getByRole("link", { name: /ver men/i });
    await expect(menuCta).toBeVisible();

    // Click the CTA
    await menuCta.click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test("renders the How It Works section", async ({ page }) => {
    await page.goto("/");

    // Scroll down to the How It Works section
    const howItWorks = page.getByRole("heading", {
      name: /cómo funciona/i,
      level: 2,
    });

    // Scroll to the heading
    await howItWorks.scrollIntoViewIfNeeded();
    await expect(howItWorks).toBeVisible();

    // Should show the 3 steps
    await expect(page.getByText(/elige tus platillos/i)).toBeVisible();
    await expect(page.getByText(/recibe en tu casa/i)).toBeVisible();
    await expect(page.getByText(/disfruta/i)).toBeVisible();
  });

  test("renders the menu preview section", async ({ page }) => {
    await page.goto("/");

    // Scroll down to find the menu preview section
    const menuPreview = page.getByRole("heading", {
      name: /menú de esta semana/i,
      level: 2,
    });
    await menuPreview.scrollIntoViewIfNeeded();
    await expect(menuPreview).toBeVisible();

    // Should have a link to view the full menu
    const fullMenuLink = page.getByRole("link", { name: /ver menú completo/i });
    await expect(fullMenuLink).toBeVisible();
  });

  test("renders the About / Why Us section", async ({ page }) => {
    await page.goto("/");

    // Scroll to find the about section
    const whyUs = page.getByRole("heading", {
      name: /por qué elegirnos/i,
      level: 2,
    });
    await whyUs.scrollIntoViewIfNeeded();
    await expect(whyUs).toBeVisible();

    // Should mention at least one feature
    await expect(page.getByText(/ingredientes frescos/i)).toBeVisible();
  });

  test("renders the final CTA section", async ({ page }) => {
    await page.goto("/");

    // Scroll to the bottom
    const finalCta = page.getByRole("heading", {
      name: /listo/i,
      level: 2,
    });
    await finalCta.scrollIntoViewIfNeeded();
    await expect(finalCta).toBeVisible();

    // There should be a link/button to the menu
    const orderNow = page.getByRole("link", { name: /ordenar ahora/i });
    await expect(orderNow).toBeVisible();
  });

  test("footer is present with social text and company name", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Should mention Litus Taste
    await expect(footer.getByText(/litus taste/i)).toBeVisible();
  });

  test("has a working navigation header", async ({ page }) => {
    await page.goto("/");

    // Header should exist
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Should have a link to the menu
    const menuLink = header.getByRole("link", { name: /menú/i });
    await expect(menuLink).toBeVisible();
  });

  test.describe("Mobile responsiveness", () => {
    test.use({ viewport: { width: 375, height: 812 } }); // iPhone X

    test("landing page is usable on mobile", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Hero heading should be visible
      await expect(
        page.getByRole("heading", { name: /comida preparada/i, level: 1 })
      ).toBeVisible();

      // Mobile menu button should be visible
      const mobileMenuButton = page.getByRole("button", { name: /menú/i });
      // OR the hamburger button
      const hamburgerButton = page.locator("button").filter({ has: page.locator("svg") }).first();
      await expect(hamburgerButton.or(mobileMenuButton)).toBeVisible();
    });
  });
});
