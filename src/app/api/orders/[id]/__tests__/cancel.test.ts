import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// ── Mock Clerk auth ────────────────────────────────────────────
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

// ── Mock Drizzle DB ────────────────────────────────────────────
const mockDbSelect = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbDelete = vi.fn().mockReturnValue({});

vi.mock("@/db", () => ({
  db: {
    select: () => mockDbSelect(),
    update: () => mockDbUpdate(),
    delete: () => mockDbDelete(),
  },
}));

// ── Mock email module (cancel route imports email.ts) ───────────
vi.mock("@/lib/email", () => ({
  sendOrderCancelledEmail: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock WhatsApp module ───────────────────────────────────────
vi.mock("@/lib/whatsapp", () => ({
  sendOrderCancelledWhatsApp: vi.fn().mockResolvedValue(undefined),
}));

/**
 * Sets up the mock chain for the cancel route's DB queries.
 * The route makes:
 *   - 2 select queries (user lookup, order lookup)
 *   - 1 update query
 *   - 1 select query (order items, no .limit())
 * Some tests return early before all queries are reached.
 */
function setupMockChain() {
  // select() → .from() → .where() → .limit()
  // For queries WITHOUT .limit(), we return an empty array (supports .map())
  const limitFn = vi.fn();
  const selectWhereFn = vi.fn().mockReturnValue(
    Object.assign([], { limit: limitFn })
  );
  const fromFn = vi.fn().mockReturnValue({ where: selectWhereFn });
  mockDbSelect.mockReturnValue({ from: fromFn });

  // update() → .set() → .where() → .returning()
  const returningFn = vi.fn();
  const updateWhereFn = vi.fn().mockReturnValue({ returning: returningFn });
  const setFn = vi.fn().mockReturnValue({ where: updateWhereFn });
  mockDbUpdate.mockReturnValue({ set: setFn });

  return { limitFn, returningFn };
}

// ── Import the cancel route handler ────────────────────────────
// Dynamic import to work around vi.mock hoisting — do once before all tests
// with a generous timeout since module resolution can be slow in jsdom.
type CancelRoute = typeof import("../cancel/route");
let PATCH: CancelRoute["PATCH"];

beforeAll(async () => {
  const mod = await import("../cancel/route");
  PATCH = mod.PATCH;
}, 20000);

describe("Cancel Order API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "order-123" }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("No autorizado");
    });
  });

  describe("user lookup", () => {
    it("returns 404 when user is not found in DB", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupMockChain();
      // User lookup returns empty
      limitFn.mockResolvedValueOnce([]);


      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "order-123" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Usuario no encontrado");
    });
  });

  describe("order ownership", () => {
    it("returns 404 when order does not exist", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupMockChain();
      // User found
      limitFn.mockResolvedValueOnce([{ id: "db-user-123", clerkId: "user-123" }]);
      // Order not found
      limitFn.mockResolvedValueOnce([]);


      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "nonexistent" }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Pedido no encontrado");
    });

    it("returns 403 when order belongs to another customer", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupMockChain();
      // User found
      limitFn.mockResolvedValueOnce([{ id: "db-user-123", clerkId: "user-123" }]);
      // Order belongs to someone else
      limitFn.mockResolvedValueOnce([
        { id: "order-123", customerId: "other-user-id", status: "pending" },
      ]);


      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "order-123" }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe("No autorizado");
    });
  });

  describe("order status check", () => {
    const setupStatusTest = (status: string) => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupMockChain();
      limitFn.mockResolvedValueOnce([{ id: "db-user-123", clerkId: "user-123" }]);
      limitFn.mockResolvedValueOnce([
        { id: "order-123", customerId: "db-user-123", status },
      ]);
      return { limitFn };
    };

    it("returns 400 when order is already received", async () => {
      setupStatusTest("recibido");


      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "order-123" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Solo puedes cancelar pedidos que estén pendientes");
    });

    it("returns 400 when order is completed", async () => {
      setupStatusTest("completed");


      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "order-123" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Solo puedes cancelar pedidos que estén pendientes");
    });

    it("returns 400 when order is already cancelled", async () => {
      setupStatusTest("cancelled");


      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "order-123" }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Solo puedes cancelar pedidos que estén pendientes");
    });
  });

  describe("successful cancellation", () => {
    it("cancels the order and returns it with status cancelled", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn, returningFn } = setupMockChain();
      // User found
      limitFn.mockResolvedValueOnce([{ id: "db-user-123", clerkId: "user-123" }]);
      // Order found, pending, belongs to user
      limitFn.mockResolvedValueOnce([
        { id: "order-123", customerId: "db-user-123", status: "pending" },
      ]);
      // Update returns cancelled order
      returningFn.mockResolvedValueOnce([
        { id: "order-123", customerId: "db-user-123", status: "cancelled" },
      ]);
      // Order items query (no .limit()) — the mock returns an empty array by default,
      // which is fine since the notification modules are mocked


      const request = new Request("http://localhost:3000/api/orders/order-123/cancel", {
        method: "PATCH",
      });
      const response = await PATCH(request, {
        params: Promise.resolve({ id: "order-123" }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("cancelled");
      expect(data.id).toBe("order-123");
    });
  });
});
