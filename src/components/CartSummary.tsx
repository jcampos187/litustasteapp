"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatCRC } from "@/lib/utils";
import Link from "next/link";

export default function CartSummary() {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <Link
      href="/cart"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-fade-in-up"
    >
      <div className="flex items-center gap-3 rounded-full bg-lt-green px-5 py-3 shadow-xl shadow-lt-green/30 transition-all hover:bg-lt-green-deep hover:shadow-2xl hover:shadow-lt-green/40">
        <div className="relative">
          <ShoppingBag className="h-5 w-5 text-white" />
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-lt-amber text-[9px] font-bold text-white">
            {totalItems}
          </span>
        </div>
        <span className="text-sm font-semibold text-white">
          {formatCRC(totalPrice)}
        </span>
        <span className="text-sm text-white/70">→</span>
      </div>
    </Link>
  );
}
