"use client";

import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatCRC } from "@/lib/utils";
import ConfirmModal from "./ConfirmModal";
import Link from "next/link";

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const [removeConfirmTarget, setRemoveConfirmTarget] = useState<string | null>(null);

  return (
    <>
      {/* Overlay */}
      <div className="lt-overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-lt-cream-dark px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-lt-warm-brown">Tu Pedido</h2>
            <p className="text-sm text-lt-charcoal/60">
              {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="mt-16 text-center">
              <ShoppingBagIcon className="mx-auto h-16 w-16 text-lt-cream-dark" />
              <p className="mt-4 text-sm text-lt-charcoal/60">
                Tu carrito está vacío
              </p>
              <Link
                href="/menu"
                onClick={onClose}
                className="mt-4 inline-flex rounded-lg bg-lt-terracotta px-5 py-2 text-sm font-medium text-white transition-all hover:bg-lt-terracotta-dark"
              >
                Ver Menú
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.mealId}
                  className="flex items-center gap-4 rounded-xl border border-lt-cream-dark p-4"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-lt-warm-brown truncate">
                      {item.mealName}
                    </p>
                    <p className="text-sm font-semibold text-lt-terracotta">
                      {formatCRC(item.price)} c/u
                    </p>
                    <p className="text-xs font-semibold text-lt-warm-brown/70">
                      Subtotal: {formatCRC(item.price * item.quantity)}
                    </p>
                    {item.portionSize && (
                      <p className="text-xs text-lt-charcoal/50">
                        {item.portionSize}
                      </p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) {
                          setRemoveConfirmTarget(item.mealId);
                        } else {
                          updateQuantity(item.mealId, item.quantity - 1);
                        }
                      }}
                      className="lt-qty-btn"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.mealId, item.quantity + 1)}
                      className="lt-qty-btn"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => setRemoveConfirmTarget(item.mealId)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-lt-charcoal/40 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-lt-cream-dark px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-lt-charcoal">Total</span>
              <span className="text-xl font-bold text-lt-terracotta">
                {formatCRC(totalPrice)}
              </span>
            </div>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-xl bg-lt-terracotta py-3 font-semibold text-white transition-all hover:bg-lt-terracotta-dark"
            >
              Ir al Carrito
            </Link>
          </div>
        )}
      </div>

      {/* ── Confirmación de eliminar artículo ── */}
      <ConfirmModal
        isOpen={removeConfirmTarget !== null}
        onClose={() => setRemoveConfirmTarget(null)}
        onConfirm={() => {
          if (removeConfirmTarget) {
            removeItem(removeConfirmTarget);
            setRemoveConfirmTarget(null);
          }
        }}
        title="Eliminar Artículo"
        message="¿Estás seguro de eliminar este artículo de tu carrito?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </>
  );
}

function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}
