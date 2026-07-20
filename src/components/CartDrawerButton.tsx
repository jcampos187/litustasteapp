"use client";

import { ShoppingBag } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "./CartProvider";
import CartDrawer from "./CartDrawer";
import { useState } from "react";

export default function CartDrawerButton() {
  const { isSignedIn } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (!isSignedIn) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-lt-cream-dark bg-white transition-all hover:border-lt-terracotta/30 hover:bg-lt-terracotta/5"
        aria-label="Carrito de compras"
      >
        <ShoppingBag className="h-5 w-5 text-lt-charcoal/70" />
        {totalItems > 0 && (
          <span className="lt-cart-badge absolute -right-1.5 -top-1.5">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && <CartDrawer onClose={() => setIsOpen(false)} />}
    </>
  );
}
