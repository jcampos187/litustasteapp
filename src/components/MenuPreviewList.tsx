"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, Minus, Trash2, LogIn } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "./CartProvider";
import ConfirmModal from "./ConfirmModal";

interface PreviewItem {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  imageUrl: string | null;
  calories: number | null;
  proteinG: number | null;
  dietaryTags: string | null;
}

interface DietaryTag {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
}

interface MenuPreviewListProps {
  items: PreviewItem[];
  tags: DietaryTag[];
}

export default function MenuPreviewList({ items, tags }: MenuPreviewListProps) {
  const { isSignedIn } = useAuth();
  const { addItem, updateQuantity, removeItem, items: cartItems } = useCart();
  const [removeConfirmTarget, setRemoveConfirmTarget] = useState<string | null>(null);

  return (
    <div className="divide-y divide-lt-card-border border-t border-lt-card-border">
      {items.map((item) => {
        const cartItem = cartItems.find((i) => i.mealId === item.id);
        const tagSlugs = item.dietaryTags
          ? item.dietaryTags.split(",").map((t) => t.trim())
          : [];

        return (
          <div key={item.id} className="flex items-center gap-4 py-4 sm:gap-6 sm:py-5">
            {/* Small thumbnail */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-lt-green/10 to-lt-terracotta/10 sm:h-20 sm:w-20">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xl opacity-40">🍽️</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate text-base font-bold text-lt-warm-brown sm:text-lg">
                  {item.name}
                </h3>
                <span className="shrink-0 text-base font-bold text-lt-terracotta sm:text-lg">
                  ₡{parseInt(item.price).toLocaleString()}
                </span>
              </div>
              {cartItem && (
                <span className="mt-0.5 block text-right text-[11px] font-semibold text-lt-warm-brown/60">
                  Subtotal: ₡{(parseInt(item.price) * cartItem.quantity).toLocaleString()} ({cartItem.quantity} unid.)
                </span>
              )}
              <p className="mt-0.5 line-clamp-1 text-sm text-lt-charcoal/50 sm:mt-1">
                {item.description}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {item.calories && (
                  <span className="text-[11px] text-lt-charcoal/40">
                    🔥 {item.calories} cal
                  </span>
                )}
                {item.proteinG && (
                  <span className="text-[11px] text-lt-charcoal/40">
                    💪 {item.proteinG}g prot.
                  </span>
                )}
                {tagSlugs.slice(0, 3).map((slug) => {
                  const tag = tags.find((t) => t.slug === slug);
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-0.5 rounded-full bg-lt-green/8 px-2 py-0.5 text-[10px] font-medium text-lt-olive-dark"
                    >
                      {tag?.emoji && <span>{tag.emoji}</span>}
                      {tag?.name || slug}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quantity controls — only for logged-in users */}
            <div className="shrink-0 self-center">
              {!isSignedIn ? (
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-lt-terracotta/30 bg-lt-terracotta/5 px-3 py-2 text-[11px] font-semibold text-lt-terracotta transition-all hover:border-lt-terracotta hover:bg-lt-terracotta/10 hover:text-lt-terracotta-dark sm:px-4 sm:py-2.5 sm:text-xs"
                >
                  <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Inicia sesión
                </Link>
              ) : cartItem ? (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => {
                      if (cartItem.quantity <= 1) {
                        removeItem(item.id);
                      } else {
                        updateQuantity(item.id, cartItem.quantity - 1);
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-lt-card-border text-lt-charcoal/50 transition-all hover:border-lt-terracotta/40 hover:text-lt-terracotta sm:h-9 sm:w-9"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lt-green/10 text-sm font-bold text-lt-green sm:h-9 sm:w-9">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-lt-card-border text-lt-charcoal/50 transition-all hover:border-lt-terracotta/40 hover:text-lt-terracotta sm:h-9 sm:w-9"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setRemoveConfirmTarget(item.id)}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-lt-charcoal/30 transition-all hover:bg-red-50 hover:text-red-400 sm:h-9 sm:w-9"
                    aria-label="Eliminar del carrito"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() =>
                    addItem({
                      mealId: item.id,
                      mealName: item.name,
                      price: parseFloat(item.price),
                      imageUrl: item.imageUrl,
                      portionSize: undefined,
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-lt-terracotta text-white shadow-sm shadow-lt-terracotta/20 transition-all hover:bg-lt-terracotta-dark hover:shadow-md hover:shadow-lt-terracotta/30 active:scale-90 sm:h-10 sm:w-10"
                  aria-label="Agregar al carrito"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>
          </div>
        );
      })}

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
        title="Eliminar del Carrito"
        message="¿Estás seguro de eliminar este platillo de tu carrito?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
