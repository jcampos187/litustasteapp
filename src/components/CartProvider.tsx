"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";

export interface CartItem {
  mealId: string;
  mealName: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  portionSize?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (mealId: string) => void;
  updateQuantity: (mealId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "litus-taste-cart";

/**
 * Safely reads initial cart state from localStorage.
 * Runs once during state initialization (lazy).
 */
function getInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const [items, setItems] = useState<CartItem[]>(getInitialCart);
  const prevUserId = useRef(userId);

  // Detect auth changes: clear cart on logout or user switch
  // NOT on initial hydration (undefined → real userId)
  useEffect(() => {
    const prev = prevUserId.current;
    if (prev !== userId) {
      // Clear only on logout (user was signed in → now not)
      // or on user switch (both are real but different)
      if (prev && (!userId || prev !== userId)) {
        setItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
      prevUserId.current = userId;
    }
  }, [userId]);

  // Persist cart to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.mealId === item.mealId);
      if (existing) {
        return prev.map((i) =>
          i.mealId === item.mealId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((mealId: string) => {
    setItems((prev) => prev.filter((i) => i.mealId !== mealId));
  }, []);

  const updateQuantity = useCallback((mealId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.mealId !== mealId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.mealId === mealId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
