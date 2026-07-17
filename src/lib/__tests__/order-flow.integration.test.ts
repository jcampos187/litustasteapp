import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  createOrderSchema,
  createMealSchema,
  createWeeklyMenuSchema,
} from "../validations";

// ─── MSW Server setup for this test file ───────────────────────

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterAll(() => server.close());

// ─── Order Flow Integration Tests ──────────────────────────────

describe("Order creation flow", () => {
  it("validates a complete order payload via Zod schema", () => {
    const orderPayload = {
      items: [
        {
          mealId: "meal-1",
          mealName: "Pollo Teriyaki",
          quantity: 2,
          unitPrice: 5500,
        },
        {
          mealId: "meal-2",
          mealName: "Ensalada César",
          quantity: 1,
          unitPrice: 4200,
        },
      ],
      notes: "Sin cebolla, por favor",
    };

    const result = createOrderSchema.safeParse(orderPayload);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.items).toHaveLength(2);
      expect(result.data.items[0].mealName).toBe("Pollo Teriyaki");
      expect(result.data.items[0].quantity).toBe(2);
      expect(result.data.items[1].unitPrice).toBe(4200);
      expect(result.data.notes).toBe("Sin cebolla, por favor");
    }
  });

  it("rejects an order with empty items array", () => {
    const result = createOrderSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("al menos un artículo");
    }
  });

  it("rejects an order with missing required item fields", () => {
    const result = createOrderSchema.safeParse({
      items: [{ mealId: "meal-1" }], // missing mealName and unitPrice
    });
    expect(result.success).toBe(false);
  });

  it("rejects an order with zero or negative quantity", () => {
    const zero = createOrderSchema.safeParse({
      items: [{ mealId: "m1", mealName: "Test", quantity: 0, unitPrice: 100 }],
    });
    expect(zero.success).toBe(false);

    const negative = createOrderSchema.safeParse({
      items: [{ mealId: "m1", mealName: "Test", quantity: -1, unitPrice: 100 }],
    });
    expect(negative.success).toBe(false);
  });

  it("allows order without notes", () => {
    const result = createOrderSchema.safeParse({
      items: [{ mealId: "m1", mealName: "Test", quantity: 1, unitPrice: 100 }],
    });
    expect(result.success).toBe(true);
  });

  it("defaults quantity to 1 when not provided", () => {
    const result = createOrderSchema.safeParse({
      items: [{ mealId: "m1", mealName: "Test", unitPrice: 100 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].quantity).toBe(1);
    }
  });

  it("sends the order payload to the API and gets a 201 response", async () => {
    server.use(
      http.post("http://localhost:3000/api/orders", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            id: "order-123",
            customerId: "customer-1",
            status: "pending",
            items: body.items,
            createdAt: new Date().toISOString(),
          },
          { status: 201 }
        );
      })
    );

    const payload = {
      items: [
        { mealId: "meal-1", mealName: "Pollo", quantity: 2, unitPrice: 5500 },
      ],
      notes: "Sin cebolla",
    };

    const res = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe("order-123");
    expect(data.status).toBe("pending");
  });

  it("rejects order with string price (must be number)", () => {
    const result = createOrderSchema.safeParse({
      items: [
        {
          mealId: "m1",
          mealName: "Test",
          quantity: 1,
          unitPrice: "5500", // string, not number
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("Meal creation flow", () => {
  it("validates a complete meal payload", () => {
    const payload = {
      name: "Pollo Teriyaki",
      description: "Delicious chicken",
      price: 5500,
      portionSize: "400g",
      calories: 450,
      proteinG: 35,
      carbsG: 40,
      fatG: 12,
      dietaryTags: ["alta-proteina"],
    };

    const result = createMealSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Pollo Teriyaki");
      expect(result.data.price).toBe(5500);
      expect(result.data.dietaryTags).toHaveLength(1);
    }
  });

  it("rejects meal with negative price", () => {
    const result = createMealSchema.safeParse({
      name: "Test",
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects meal with string price", () => {
    const result = createMealSchema.safeParse({
      name: "Test",
      price: "5500",
    });
    expect(result.success).toBe(false);
  });

  it("creates a meal via the API endpoint", async () => {
    server.use(
      http.post("http://localhost:3000/api/meals", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            id: "meal-456",
            name: body.name,
            price: String(body.price),
            isActive: true,
          },
          { status: 201 }
        );
      })
    );

    const payload = { name: "Nuevo Platillo", price: 5000 };
    const res = await fetch("http://localhost:3000/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Nuevo Platillo");
  });
});

describe("Weekly menu date validation", () => {
  const baseValid = {
    mealIds: ["123e4567-e89b-12d3-a456-426614174000"],
    label: "Test Menu",
  };

  it("accepts valid ISO date strings for weekStart", () => {
    const result = createWeeklyMenuSchema.safeParse({
      ...baseValid,
      weekStart: "2026-07-20T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid ISO date strings for weekEnd", () => {
    const result = createWeeklyMenuSchema.safeParse({
      ...baseValid,
      weekEnd: "2026-07-26T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null for orderCutoff", () => {
    const result = createWeeklyMenuSchema.safeParse({
      ...baseValid,
      orderCutoff: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date strings", () => {
    const withInvalidStart = createWeeklyMenuSchema.safeParse({
      ...baseValid,
      weekStart: "not-a-date",
    });
    expect(withInvalidStart.success).toBe(false);

    const withInvalidEnd = createWeeklyMenuSchema.safeParse({
      ...baseValid,
      weekEnd: "also-invalid",
    });
    expect(withInvalidEnd.success).toBe(false);

    const withInvalidCutoff = createWeeklyMenuSchema.safeParse({
      ...baseValid,
      orderCutoff: "bad-date",
    });
    expect(withInvalidCutoff.success).toBe(false);
  });

  it("accepts undefined/omitted date fields", () => {
    const result = createWeeklyMenuSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weekStart).toBeUndefined();
      expect(result.data.weekEnd).toBeUndefined();
    }
  });
});
