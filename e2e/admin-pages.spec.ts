import { test, expect } from "@playwright/test";

test.describe("Admin Pages — Guest Protection", () => {
  const adminRoutes = [
    { path: "/admin", name: "Dashboard" },
    { path: "/admin/menu", name: "Menu Management" },
    { path: "/admin/orders", name: "Orders Management" },
    { path: "/admin/customers", name: "Customers Management" },
    { path: "/admin/customers/invite", name: "Invite Customer" },
    { path: "/admin/weekly-menu", name: "Weekly Menu" },
    { path: "/admin/weekly-menu/history", name: "Weekly Menu History" },
    { path: "/admin/settings", name: "Settings" },
    { path: "/admin/approvals", name: "Approvals" },
  ];

  for (const route of adminRoutes) {
    test(`guest is redirected to sign-in when accessing ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL(/sign/i);
    });
  }

  test("guest cannot access admin order detail page", async ({ page }) => {
    await page.goto("/admin/orders/some-order-id");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sign/i);
  });

  test("guest cannot access admin customer detail page", async ({ page }) => {
    await page.goto("/admin/customers/some-customer-id");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sign/i);
  });

  test("guest cannot access admin create-meal page", async ({ page }) => {
    await page.goto("/admin/menu/new");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sign/i);
  });

  test("guest cannot access admin edit-meal page", async ({ page }) => {
    await page.goto("/admin/menu/some-meal-id/edit");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sign/i);
  });
});

test.describe("Admin Pages — Console Errors", () => {
  test("no console errors when accessing /admin as guest", async ({ page }) => {
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

  test("no console errors on /admin/menu as guest", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/admin/menu");
    await page.waitForLoadState("networkidle");

    const realErrors = errors.filter(
      (e) =>
        !e.toLowerCase().includes("clerk") &&
        !e.toLowerCase().includes("third-party")
    );
    expect(realErrors).toHaveLength(0);
  });
});

test.describe("Admin Pages — Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("guest redirected to sign-in on /admin (mobile)", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sign/i);
  });

  test("guest redirected to sign-in on /admin/orders (mobile)", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/sign/i);
  });
});
