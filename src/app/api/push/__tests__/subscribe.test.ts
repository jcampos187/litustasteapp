import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// ─── Mock Clerk auth ────────────────────────────────────────────
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
}));

// ─── Mock Drizzle DB ────────────────────────────────────────────
const mockDbSelect = vi.fn();
const mockDbInsert = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbDelete = vi.fn();

vi.mock("@/db", () => ({
  db: {
    select: () => mockDbSelect(),
    insert: () => mockDbInsert(),
    update: () => mockDbUpdate(),
    delete: () => mockDbDelete(),
  },
}));

/**
 * Sets up the mock chain for select queries.
 * select() → .from() → .where() → .limit()
 */
function setupSelectChain() {
  const limitFn = vi.fn();
  const whereFn = vi.fn().mockReturnValue({ limit: limitFn });
  const fromFn = vi.fn().mockReturnValue({ where: whereFn });
  mockDbSelect.mockReturnValue({ from: fromFn });
  return { limitFn, whereFn, fromFn };
}

/**
 * Sets up the mock chain for insert queries.
 * insert() → .values()
 */
function setupInsertChain() {
  const valuesFn = vi.fn();
  mockDbInsert.mockReturnValue({ values: valuesFn });
  return { valuesFn };
}

/**
 * Sets up the mock chain for update queries.
 * update() → .set() → .where()
 */
function setupUpdateChain() {
  const whereFn = vi.fn();
  const setFn = vi.fn().mockReturnValue({ where: whereFn });
  mockDbUpdate.mockReturnValue({ set: setFn });
  return { whereFn, setFn };
}

/**
 * Sets up the mock chain for delete queries.
 * delete() → .where()
 */
function setupDeleteChain() {
  const whereFn = vi.fn();
  mockDbDelete.mockReturnValue({ where: whereFn });
  return { whereFn };
}

type PushRoute = typeof import("../subscribe/route");
let POST: PushRoute["POST"];
let DELETE: PushRoute["DELETE"];

beforeAll(async () => {
  const mod = await import("../subscribe/route");
  POST = mod.POST;
  DELETE = mod.DELETE;
}, 20000);

describe("POST /api/push/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authentication", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new Request("http://localhost:3000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "https://example.com" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("No autorizado");
    });
  });

  describe("user lookup", () => {
    it("returns 404 when user is not found in DB", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupSelectChain();
      limitFn.mockResolvedValueOnce([]);

      const request = new Request("http://localhost:3000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "https://example.com" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Usuario no encontrado");
    });
  });

  describe("validation", () => {
    it("returns 400 when endpoint is missing", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupSelectChain();
      limitFn.mockResolvedValueOnce([{ id: "db-user-123" }]);

      const request = new Request("http://localhost:3000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p256dh: "abc", auth: "def" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("returns 400 when p256dh is missing", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupSelectChain();
      limitFn.mockResolvedValueOnce([{ id: "db-user-123" }]);

      const request = new Request("http://localhost:3000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "https://example.com", auth: "def" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("returns 400 when auth is missing", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupSelectChain();
      limitFn.mockResolvedValueOnce([{ id: "db-user-123" }]);

      const request = new Request("http://localhost:3000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "https://example.com", p256dh: "abc" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe("subscription management", () => {
    it("creates a new subscription when none exists", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupSelectChain();
      // First call: user lookup
      limitFn.mockResolvedValueOnce([{ id: "db-user-123" }]);
      // Second call: check for existing subscription — returns empty
      limitFn.mockResolvedValueOnce([]);

      const { valuesFn } = setupInsertChain();
      valuesFn.mockResolvedValueOnce(undefined);

      const request = new Request("http://localhost:3000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "https://example.com/push/endpoint",
          p256dh: "base64-p256dh-key",
          auth: "base64-auth-key",
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      expect(valuesFn).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "db-user-123",
          endpoint: "https://example.com/push/endpoint",
          p256dh: "base64-p256dh-key",
          auth: "base64-auth-key",
        })
      );
    });

    it("updates existing subscription when same endpoint exists", async () => {
      mockAuth.mockResolvedValue({ userId: "user-123" });
      const { limitFn } = setupSelectChain();
      // User lookup
      limitFn.mockResolvedValueOnce([{ id: "db-user-123" }]);
      // Existing subscription found
      limitFn.mockResolvedValueOnce([{ id: "sub-123", userId: "db-user-123", endpoint: "https://example.com/push/endpoint" }]);

      const { setFn } = setupUpdateChain();
      // setFn already returns { where: whereFn } via mockReturnValue — no need for mockResolvedValueOnce

      const request = new Request("http://localhost:3000/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "https://example.com/push/endpoint",
          p256dh: "new-p256dh-key",
          auth: "new-auth-key",
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(setFn).toHaveBeenCalledWith(
        expect.objectContaining({
          p256dh: "new-p256dh-key",
          auth: "new-auth-key",
          updatedAt: expect.any(Date),
        })
      );
    });
  });
});

describe("DELETE /api/push/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const request = new Request("http://localhost:3000/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: "https://example.com" }),
    });
    const response = await DELETE(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("No autorizado");
  });

  it("returns 404 when user is not found in DB", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" });
    const { limitFn } = setupSelectChain();
    limitFn.mockResolvedValueOnce([]);

    const request = new Request("http://localhost:3000/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: "https://example.com" }),
    });
    const response = await DELETE(request);

    expect(response.status).toBe(404);
  });

  it("returns 400 when endpoint is missing", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" });
    const { limitFn } = setupSelectChain();
    limitFn.mockResolvedValueOnce([{ id: "db-user-123" }]);

    const request = new Request("http://localhost:3000/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await DELETE(request);

    expect(response.status).toBe(400);
  });

  it("deletes the subscription successfully", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" });
    const { limitFn } = setupSelectChain();
    limitFn.mockResolvedValueOnce([{ id: "db-user-123" }]);

    const { whereFn } = setupDeleteChain();
    whereFn.mockResolvedValueOnce(undefined);

    const request = new Request("http://localhost:3000/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: "https://example.com/push/endpoint" }),
    });
    const response = await DELETE(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
