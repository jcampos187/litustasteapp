"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatCRC } from "@/lib/utils";
import DietaryTagBadge from "./DietaryTagBadge";

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    description: string;
    price: string;
    imageUrl?: string | null;
    portionSize?: string | null;
    calories?: number | null;
    proteinG?: number | null;
    dietaryTags?: string | null;
  };
  tags?: Array<{ id: string; name: string; slug: string; emoji: string | null }>;
}

export default function MealCard({ meal, tags = [] }: MealCardProps) {
  const { addItem, items } = useCart();
  const cartItem = items.find((i) => i.mealId === meal.id);
  const imageUrl = meal.imageUrl || "/placeholder-meal.svg";

  const tagSlugs = meal.dietaryTags
    ? meal.dietaryTags.split(",").map((t) => t.trim())
    : [];

  return (
    <div className="lt-card group">
      {/* Image */}
      <div className="lt-card-image relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-lt-terracotta/10 to-lt-green-pale/10">
        {meal.imageUrl ? (
          <Image
            src={imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl opacity-30">🍽️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-lt-warm-brown">{meal.name}</h3>
          <span className="shrink-0 text-lg font-bold tracking-tight text-lt-terracotta">
            {formatCRC(meal.price)}
          </span>
        </div>

        {/* Portion size */}
        {meal.portionSize && (
          <p className="mt-1 text-xs text-lt-charcoal/40">{meal.portionSize}</p>
        )}

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-lt-charcoal/55 line-clamp-2">
          {meal.description}
        </p>

        {/* Macros */}
        {(meal.calories || meal.proteinG) && (
          <div className="mt-3 flex items-center gap-3 text-xs text-lt-charcoal/40">
            {meal.calories && (
              <span className="flex items-center gap-1">
                <span>🔥</span> {meal.calories} cal
              </span>
            )}
            {meal.proteinG && (
              <span className="flex items-center gap-1">
                <span>💪</span> {meal.proteinG}g proteína
              </span>
            )}
          </div>
        )}

        {/* Dietary tags */}
        {tagSlugs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tagSlugs.map((slug) => {
              const tag = tags.find((t) => t.slug === slug);
              return (
                <DietaryTagBadge key={slug} slug={slug} name={tag?.name || slug} emoji={tag?.emoji || null} />
              );
            })}
          </div>
        )}

        {/* Add to cart + qty */}
        <div className="mt-5 flex items-center justify-between border-t border-lt-card-border pt-4">
          {cartItem ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-lt-olive-dark">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lt-olive-dark/10 text-xs">{cartItem.quantity}</span>
              en carrito
            </span>
          ) : (
            <span className="text-sm text-lt-charcoal/35">Agregar al pedido</span>
          )}
          <button
            onClick={() =>
              addItem({
                mealId: meal.id,
                mealName: meal.name,
                price: parseFloat(meal.price),
                imageUrl: meal.imageUrl,
                portionSize: meal.portionSize,
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-lt-terracotta text-white shadow-sm shadow-lt-terracotta/20 transition-all hover:bg-lt-terracotta-dark hover:shadow-md hover:shadow-lt-terracotta/30 active:scale-90"
            aria-label="Agregar al carrito"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
