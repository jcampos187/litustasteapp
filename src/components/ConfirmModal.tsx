"use client";

import { AlertTriangle, ShoppingBag, X } from "lucide-react";
import { formatCRC } from "@/lib/utils";
import type { CartItem } from "./CartProvider";

interface ConfirmModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Called when the user cancels / closes */
  onClose: () => void;
  /** Called when the user confirms */
  onConfirm: () => void;
  /** Title of the modal */
  title: string;
  /** Main message body */
  message: string;
  /** Label for the confirm button (default "Confirmar") */
  confirmLabel?: string;
  /** Label for the cancel button (default "Cancelar") */
  cancelLabel?: string;
  /** Whether the confirm action is loading */
  isLoading?: boolean;
  /** Visual variant */
  variant?: "danger" | "info";
  /** Optional — show a mini order summary (cart items + total) */
  items?: CartItem[];
  totalPrice?: number;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  variant = "danger",
  items,
  totalPrice,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isOrderSummary = variant === "info";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-fade-in-up">
        <div className="mx-4 rounded-2xl border border-lt-cream-dark bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-lt-cream-dark px-6 py-4">
            <div className="flex items-center gap-3">
              {isOrderSummary ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lt-terracotta/10">
                  <ShoppingBag className="h-5 w-5 text-lt-terracotta" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              )}
              <h3 className="text-lg font-bold text-lt-warm-brown">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lt-charcoal/40 transition-colors hover:bg-gray-100 hover:text-lt-charcoal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-sm leading-relaxed text-lt-charcoal/70">{message}</p>

            {/* Order summary (only for order confirmation) */}
            {isOrderSummary && items && items.length > 0 && (
              <div className="mt-4 rounded-xl border border-lt-cream-dark bg-lt-cream/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/40">
                  Resumen del pedido
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.mealId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate text-lt-warm-brown">
                        {item.mealName}
                        <span className="ml-1 text-lt-charcoal/40">
                          ×{item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold text-lt-terracotta">
                        {formatCRC(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-lt-cream-dark pt-3">
                  <span className="text-sm font-medium text-lt-charcoal">Total</span>
                  <span className="text-lg font-bold text-lt-terracotta">
                    {formatCRC(totalPrice ?? 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-lt-cream-dark px-6 py-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-lt-cream-dark px-5 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50 ${
                isOrderSummary
                  ? "bg-lt-terracotta hover:bg-lt-terracotta-dark"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {confirmLabel}
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
