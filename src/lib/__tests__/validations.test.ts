import { describe, it, expect } from "vitest";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  registerSchema,
  createMealSchema,
  updateMealSchema,
  settingsSchema,
  createInviteSchema,
  approveUserSchema,
  updateProfileSchema,
} from "../validations";

describe("createOrderSchema", () => {
  it("validates a correct order payload", () => {
    const result = createOrderSchema.safeParse({
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
      notes: "Sin cebolla",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an order with no items", () => {
    const result = createOrderSchema.safeParse({
      items: [],
      notes: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("al menos un artículo");
    }
  });

  it("rejects an order with invalid quantity (zero)", () => {
    const result = createOrderSchema.safeParse({
      items: [
        {
          mealId: "meal-1",
          mealName: "Pollo",
          quantity: 0,
          unitPrice: 5000,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an order with missing required fields", () => {
    const result = createOrderSchema.safeParse({
      items: [
        {
          mealId: "meal-1",
          // missing mealName
          quantity: 1,
          unitPrice: 5000,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("allows order without notes", () => {
    const result = createOrderSchema.safeParse({
      items: [
        {
          mealId: "meal-1",
          mealName: "Pollo",
          quantity: 1,
          unitPrice: 5000,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("defaults quantity to 1 if not provided", () => {
    const result = createOrderSchema.safeParse({
      items: [
        {
          mealId: "meal-1",
          mealName: "Pollo",
          unitPrice: 5000,
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0].quantity).toBe(1);
    }
  });
});

describe("updateOrderStatusSchema", () => {
  it("accepts valid statuses", () => {
    const valid = ["pending", "recibido", "completed", "cancelled"];
    for (const status of valid) {
      expect(updateOrderStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "invalid-status" });
    expect(result.success).toBe(false);
  });

  it("rejects empty status", () => {
    const result = updateOrderStatusSchema.safeParse({ status: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates a correct registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "8888-8888",
      deliveryAddress: "San José, Rohrmoser",
      password: "securePassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      phone: "8888-8888",
      deliveryAddress: "San José",
      password: "1234567",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("8 caracteres");
    }
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "not-an-email",
      phone: "8888-8888",
      deliveryAddress: "San José",
      password: "securePassword123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "",
      phone: "",
      deliveryAddress: "",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createMealSchema", () => {
  it("validates a correct meal payload", () => {
    const result = createMealSchema.safeParse({
      name: "Pollo Teriyaki",
      description: "Pollo glaseado con salsa teriyaki",
      price: 5500,
      portionSize: "400g",
      calories: 450,
      proteinG: 35,
      carbsG: 40,
      fatG: 12,
      dietaryTags: ["alta-proteina", "sin-gluten"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects meal without name", () => {
    const result = createMealSchema.safeParse({
      price: 5000,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createMealSchema.safeParse({
      name: "Test",
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects string price (must be number)", () => {
    const result = createMealSchema.safeParse({
      name: "Test",
      price: "5500",
    });
    expect(result.success).toBe(false);
  });

  it("defaults description to empty string", () => {
    const result = createMealSchema.safeParse({
      name: "Test",
      price: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });
});

describe("updateMealSchema", () => {
  it("extends createMealSchema with isActive", () => {
    const result = updateMealSchema.safeParse({
      name: "Pollo Teriyaki",
      description: "Updated description",
      price: 6000,
      isActive: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(false);
    }
  });

  it("isActive is optional", () => {
    const result = updateMealSchema.safeParse({
      name: "Pollo Teriyaki",
      description: "Test",
      price: 5000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBeUndefined();
    }
  });
});

describe("settingsSchema", () => {
  it("validates correct settings", () => {
    const result = settingsSchema.safeParse({
      businessName: "Litus Taste",
      description: "Comida preparada",
      contactEmail: "info@litustaste.com",
      contactPhone: "8888-8888",
      address: "San José, Costa Rica",
    });
    expect(result.success).toBe(true);
  });

  it("defaults businessName to 'Litus Taste'", () => {
    const result = settingsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.businessName).toBe("Litus Taste");
    }
  });

  it("rejects invalid email", () => {
    const result = settingsSchema.safeParse({
      businessName: "Test",
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("createInviteSchema", () => {
  it("validates correct email", () => {
    const result = createInviteSchema.safeParse({ email: "client@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = createInviteSchema.safeParse({ email: "not-valid" });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = createInviteSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("approveUserSchema", () => {
  it("validates approve action", () => {
    const result = approveUserSchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      action: "approve",
      clerkId: "clerk_user_123",
    });
    expect(result.success).toBe(true);
  });

  it("validates decline action", () => {
    const result = approveUserSchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      action: "decline",
      clerkId: "clerk_user_123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid action", () => {
    const result = approveUserSchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      action: "invalid",
      clerkId: "clerk_user_123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid UUID", () => {
    const result = approveUserSchema.safeParse({
      userId: "not-a-uuid",
      action: "approve",
      clerkId: "clerk_user_123",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("validates partial profile update", () => {
    const result = updateProfileSchema.safeParse({
      name: "Juan Pérez",
      phone: "8888-8888",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (no fields updated)", () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects excessively long name", () => {
    const result = updateProfileSchema.safeParse({
      name: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});
