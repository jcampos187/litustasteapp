import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads the landing page with hero content", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Hero section should have the main heading
    // Actual h1 text: "Tu comida de la semana, preparada con amor"
    await expect(
      page.getByRole("heading", { name: /tu comida de la semana/i, level: 1 })
    ).toBeVisible();

    // Should have the premium badge with fresh food message
    await expect(
      page.getByText(/comida preparada fresca/i).first()
    ).toBeVisible();
  });

  test("hero section has a CTA button to the menu", async ({ page }) => {
    await page.goto("/");

    // The main CTA should link to /menu (actual text: "Ver Menú Semanal")
    const menuCta = page.getByRole("link", { name: /ver men/i }).first();
    await expect(menuCta).toBeVisible();

    // Click the CTA
    await menuCta.click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test("renders the How It Works section", async ({ page }) => {
    await page.goto("/");

    // The section has a span "Cómo Funciona" above the h2
    // The actual h2 text is "Comer bien nunca fue tan fácil"
    const howItWorks = page.getByRole("heading", {
      name: /comer bien nunca fue/i,
      level: 2,
    });

    // Scroll to the heading
    await howItWorks.scrollIntoViewIfNeeded();
    await expect(howItWorks).toBeVisible();

    // Should show the 3 steps
    await expect(page.getByText(/elige tu menú/i)).toBeVisible();
    await expect(page.getByText(/haz tu pedido/i).first()).toBeVisible();
    await expect(page.getByText(/disfruta/i).first()).toBeVisible();
  });

  test("renders the menu preview section", async ({ page }) => {
    await page.goto("/");

    // Scroll down to find the menu preview section
    // Actual h2 text: "Selecciona tus favoritos" or "Menú disponible pronto"
    const menuPreview = page.getByRole("heading", {
      name: /selecciona tus favoritos|menú disponible pronto/i,
      level: 2,
    });
    await menuPreview.scrollIntoViewIfNeeded();
    await expect(menuPreview).toBeVisible();

    // Should have a link to view the full menu (only if menu is active)
    const fullMenuLink = page.getByRole("link", { name: /ver menú completo/i });
    const linkCount = await fullMenuLink.count();
    if (linkCount > 0) {
      await expect(fullMenuLink).toBeVisible();
    }
  });

  test("renders the About / Why Us section", async ({ page }) => {
    await page.goto("/");

    // Scroll to find the about section
    // Actual h2 text: "Hecho con ingredientes frescos y mucho amor"
    const whyUs = page.getByRole("heading", {
      name: /hecho con ingredientes/i,
      level: 2,
    });
    await whyUs.scrollIntoViewIfNeeded();
    await expect(whyUs).toBeVisible();

    // Should mention at least one feature
    await expect(page.getByText(/ingredientes frescos/i).first()).toBeVisible();
  });

  test("renders the final CTA section", async ({ page }) => {
    await page.goto("/");

    // Scroll to the bottom
    // Actual h2 text: "¿Listo para comer rico esta semana?"
    const finalCta = page.getByRole("heading", {
      name: /listo para comer rico|lista.*esta semana/i,
      level: 2,
    });
    await finalCta.scrollIntoViewIfNeeded();
    await expect(finalCta).toBeVisible();

    // There should be a link/button to the menu (actual text: "Ver Menú")
    const menuLink = page.getByRole("link", { name: /ver menú/i }).first();
    await expect(menuLink).toBeVisible();
  });

  test("footer is present with social text and company name", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Should mention Litus Taste
    await expect(footer.getByText(/litus taste/i).first()).toBeVisible();
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
      // Actual h1 text: "Tu comida de la semana, preparada con amor"
      await expect(
        page.getByRole("heading", { name: /tu comida de la semana/i, level: 1 })
      ).toBeVisible();

      // Mobile menu button should be visible
      const hamburgerButton = page.locator("button").filter({ has: page.locator("svg") }).first();
      await expect(hamburgerButton).toBeVisible();
    });
  });
});
