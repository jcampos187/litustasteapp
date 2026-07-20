import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../CartProvider";
import type { ReactNode } from "react";

// Mock Clerk
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({
    userId: "test-user-id",
    isSignedIn: true,
    isLoaded: true,
  }),
  ClerkProvider: ({ children }: { children: ReactNode }) => children,
  SignedIn: ({ children }: { children: ReactNode }) => children,
  SignedOut: () => null,
}));

// Wrap the hook in CartProvider
function wrapper({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

const mockItem = {
  mealId: "meal-1",
  mealName: "Pollo Teriyaki",
  price: 5500,
  imageUrl: null,
  portionSize: "400g",
};

const mockItem2 = {
  mealId: "meal-2",
  mealName: "Ensalada César",
  price: 4200,
  imageUrl: null,
  portionSize: null,
};

describe("CartProvider", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("addItem", () => {
    it("adds a new item to the cart with quantity 1", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].mealId).toBe("meal-1");
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.items[0].mealName).toBe("Pollo Teriyaki");
    });

    it("increments quantity when adding an existing item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      act(() => {
        result.current.addItem(mockItem);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it("adds multiple different items", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem2);
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0].mealId).toBe("meal-1");
      expect(result.current.items[1].mealId).toBe("meal-2");
    });
  });

  describe("removeItem", () => {
    it("removes an item from the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem2);
      });

      act(() => {
        result.current.removeItem("meal-1");
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].mealId).toBe("meal-2");
    });

    it("removes nothing when mealId does not exist", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      act(() => {
        result.current.removeItem("non-existent");
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity of an existing item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      act(() => {
        result.current.updateQuantity("meal-1", 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it("removes the item when quantity is set to 0", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      act(() => {
        result.current.updateQuantity("meal-1", 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it("removes the item when quantity is negative", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      act(() => {
        result.current.updateQuantity("meal-1", -5);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("removes all items from the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
        result.current.addItem(mockItem2);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("totalItems", () => {
    it("returns 0 for an empty cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.totalItems).toBe(0);
    });

    it("sums quantities of all items", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem); // qty 1
        result.current.addItem(mockItem); // qty 2
        result.current.addItem(mockItem); // qty 3
        result.current.addItem(mockItem2); // qty 1
      });

      expect(result.current.totalItems).toBe(4);
    });

    it("handles multiple items with different quantities", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem); // qty 1
        result.current.addItem(mockItem); // qty 2
        result.current.addItem(mockItem2); // qty 1
        result.current.addItem(mockItem2); // qty 2
        result.current.addItem(mockItem2); // qty 3
      });

      expect(result.current.totalItems).toBe(5);
    });
  });

  describe("totalPrice", () => {
    it("returns 0 for an empty cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      expect(result.current.totalPrice).toBe(0);
    });

    it("calculates total price from all items", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem); // 5500 × 1
        result.current.addItem(mockItem2); // 4200 × 1
      });

      expect(result.current.totalPrice).toBe(9700);
    });

    it("calculates total with multiple quantities", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem); // 5500
        result.current.addItem(mockItem); // 11000
        result.current.addItem(mockItem); // 16500
        result.current.addItem(mockItem2); // 20700
      });

      expect(result.current.totalPrice).toBe(20700);
    });
  });

  describe("localStorage persistence", () => {
    it("persists cart to localStorage on add", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      const stored = JSON.parse(localStorage.getItem("litus-taste-cart") || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0].mealId).toBe("meal-1");
    });

    it("persists cart to localStorage on remove", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => {
        result.current.addItem(mockItem);
      });

      act(() => {
        result.current.removeItem("meal-1");
      });

      const stored = JSON.parse(localStorage.getItem("litus-taste-cart") || "[]");
      expect(stored).toHaveLength(0);
    });
  });

  describe("useCart hook", () => {
    it("throws error when used outside CartProvider", () => {
      // Suppress console.error for this test (React will log the error)
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => renderHook(() => useCart())).toThrow(
        "useCart must be used within a CartProvider"
      );

      consoleSpy.mockRestore();
    });
  });
});
