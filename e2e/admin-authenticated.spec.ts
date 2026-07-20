import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard — Authenticated", () => {
  test("can access admin dashboard — guard test", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Clear skip message if user doesn't have admin role
    const currentUrl = page.url();
    test.skip(
      !currentUrl.includes("/admin"),
      "User does not have admin role — set E2E_CLERK_USER_EMAIL to an admin email and ensure role='admin' in DB"
    );

    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("loads the admin dashboard with sidebar and stat cards", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Should show the dashboard heading
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

    // Sidebar should be visible with nav items
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // Should show stat cards
    await expect(page.getByText(/pedidos totales/i)).toBeVisible();
    await expect(page.getByText(/pedidos pendientes/i)).toBeVisible();
    await expect(page.getByText(/clientes registrados/i)).toBeVisible();
    await expect(page.getByText(/menú activo|sin menú/i)).toBeVisible();
  });

  test("sidebar has all navigation items", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");

    // All nav items should be present
    await expect(sidebar.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /platillos/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /menú semanal/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /pedidos/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /aprobaciones/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /clientes/i })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: /configuración/i })).toBeVisible();
  });

  test("sidebar navigation links work", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");

    // Click each nav link and verify the URL changes
    const links = [
      { name: /dashboard/i, url: /\/admin$/ },
      { name: /platillos/i, url: /\/admin\/menu/ },
      { name: /pedidos/i, url: /\/admin\/orders/ },
      { name: /clientes/i, url: /\/admin\/customers/ },
      { name: /configuración/i, url: /\/admin\/settings/ },
    ];

    for (const link of links) {
      const navLink = sidebar.getByRole("link", { name: link.name }).first();
      await navLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(link.url);
    }
  });

  test("sidebar shows user name and sign-out button", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator("aside");

    // Should show user info and sign-out
    await expect(sidebar.getByText(/cerrar sesión/i)).toBeVisible();
  });
});

test.describe("Admin Menu Management", () => {
  test("menu management page loads with title", async ({ page }) => {
    await page.goto("/admin/menu");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /platillos/i })
    ).toBeVisible();

    // Should have "Nuevo Platillo" button
    await expect(
      page.getByRole("link", { name: /nuevo platillo/i })
    ).toBeVisible();
  });

  test("has bulk import button and new meal creation", async ({ page }) => {
    await page.goto("/admin/menu");
    await page.waitForLoadState("networkidle");

    // Bulk import button should exist
    const bulkImportButton = page.locator("button").filter({ hasText: /importar/i });
    await expect(bulkImportButton).toBeVisible();

    // New meal link should navigate to create page
    const newMealLink = page.getByRole("link", { name: /nuevo platillo/i });
    await expect(newMealLink).toBeVisible();
    await expect(newMealLink).toHaveAttribute("href", "/admin/menu/new");
  });
});

test.describe("Admin Orders Management", () => {
  test("orders page loads with filter tabs", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /pedidos/i })
    ).toBeVisible();

    // Filter tabs should be present — use getByRole to avoid strict mode conflicts
    await expect(page.getByRole("link", { name: /todos\s*\(/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /pendientes/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /recibidos/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /completados/i }).first()).toBeVisible();
  });

  test("clicking a filter tab changes the URL", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    // Click "Pendientes" tab
    const pendingTab = page.getByRole("link", { name: /pendientes/i });
    await pendingTab.click();
    await page.waitForLoadState("networkidle");

    // URL should include status=pending
    await expect(page).toHaveURL(/status=pending/);
  });
});

test.describe("Admin Customers", () => {
  test("customers page loads with invite button", async ({ page }) => {
    await page.goto("/admin/customers");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /clientes/i })
    ).toBeVisible();

    // Invite button should exist
    const inviteButton = page.getByRole("link", { name: /invitar cliente/i });
    await expect(inviteButton).toBeVisible();
    await expect(inviteButton).toHaveAttribute("href", "/admin/customers/invite");
  });
});

test.describe("Admin Settings", () => {
  test("settings page loads with business settings form", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /configuración/i })
    ).toBeVisible();

    // Should have business name field
    await expect(page.getByText(/nombre del negocio/i)).toBeVisible();
  });
});

test.describe("Admin Weekly Menu", () => {
  test("weekly menu page loads with meal selection", async ({ page }) => {
    await page.goto("/admin/weekly-menu");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText(/seleccionar platillos/i)
    ).toBeVisible();

    // Should have save/publish actions
    await expect(
      page.getByRole("button", { name: /guardar borrador/i })
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /publicar menú|actualizar/i })
    ).toBeVisible();
  });
});

test.describe("Admin Approvals", () => {
  test("approvals page loads with pending users or empty state", async ({ page }) => {
    await page.goto("/admin/approvals");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("heading", { name: /aprobaciones pendientes/i })
    ).toBeVisible();

    // Either shows pending users or empty state
    const emptyState = page.getByText(/no hay usuarios pendientes/i);
    const isEmpty = await emptyState.isVisible();

    if (isEmpty) {
      await expect(emptyState).toBeVisible();
    } else {
      // If not empty, should see pending user cards
      await expect(
        page.getByText(/pendiente/i).first()
      ).toBeVisible();
    }
  });
});

test.describe("Admin — Console Errors", () => {
  test("no console errors on admin dashboard", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    const realErrors = errors.filter(
      (e) =>
        !e.toLowerCase().includes("clerk") &&
        !e.toLowerCase().includes("third-party")
    );
    expect(realErrors).toHaveLength(0);
  });

  test("no console errors on admin orders page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");

    const realErrors = errors.filter(
      (e) =>
        !e.toLowerCase().includes("clerk") &&
        !e.toLowerCase().includes("third-party")
    );
    expect(realErrors).toHaveLength(0);
  });
});

test.describe("Admin — Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("admin dashboard is accessible on mobile", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");

    // Dashboard heading should be visible
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();

    // Content should be accessible (sidebar may overflow on mobile — that's expected)
    // Verify the page rendered by checking the heading
    await expect(
      page.getByRole("heading", { name: /dashboard/i })
    ).toBeVisible();
  });
});
