"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus, Minus, Trash2, LogIn } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "@/components/CartProvider";
import { formatCRC } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  portionSize: string | null;
  imageUrl: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  dietaryTags: string | null;
  sortOrder: number | null;
}

interface DietaryTag {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
}

interface MenuClientProps {
  menu: {
    id: string;
    label: string;
    weekStart: Date;
    weekEnd: Date;
    orderCutoff: Date | null;
  } | null;
  items: MenuItem[];
  tags: DietaryTag[];
}

export default function MenuClient({ menu, items, tags }: MenuClientProps) {
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { isSignedIn } = useAuth();
  const { addItem, updateQuantity, removeItem, items: cartItems } = useCart();

  const toggleTag = (slug: string) => {
    setActiveTags((prev) =>
      prev.includes(slug)
        ? prev.filter((t) => t !== slug)
        : [...prev, slug]
    );
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (activeTags.length > 0) {
        const itemTags = item.dietaryTags
          ? item.dietaryTags.split(",").map((t) => t.trim())
          : [];
        const hasTag = activeTags.some((tag) => itemTags.includes(tag));
        if (!hasTag) return false;
      }

      return true;
    });
  }, [items, search, activeTags]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CR", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-lt-warm-brown sm:text-4xl">
          {menu ? menu.label : "Menú de la Semana"}
        </h1>
        {menu && (
          <p className="mt-2 text-lg text-lt-charcoal/60">
            {formatDate(menu.weekStart)} — {formatDate(menu.weekEnd)}
          </p>
        )}
        {menu?.orderCutoff && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm text-amber-800">
            <span>⏰</span>
            <span>
              Pedidos hasta el{" "}
              {new Date(menu.orderCutoff).toLocaleDateString("es-CR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mt-10">
        {/* Search + Filter toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lt-charcoal/40" />
            <input
              type="text"
              placeholder="Buscar platillos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-lt-cream-dark bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              showFilters || activeTags.length > 0
                ? "border-lt-terracotta bg-lt-terracotta/5 text-lt-terracotta"
                : "border-lt-cream-dark text-lt-charcoal/60 hover:border-lt-charcoal/30"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {activeTags.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lt-terracotta text-[11px] font-bold text-white">
                {activeTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Tag filters */}
        {showFilters && (
          <div className="mt-4 animate-fade-in-up">
            <div className="rounded-2xl border border-lt-cream-dark bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">
                Filtrar por categoría dietética
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.slug)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                      activeTags.includes(tag.slug)
                        ? "border-lt-terracotta bg-lt-terracotta text-white"
                        : "border-lt-cream-dark text-lt-charcoal/60 hover:border-lt-charcoal/30"
                    }`}
                  >
                    {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="mt-4 text-sm text-lt-charcoal/50">
          {filteredItems.length} {filteredItems.length === 1 ? "platillo" : "platillos"} disponibles
        </p>
      </div>

      {/* List */}
      <div className="mt-6 divide-y divide-lt-card-border border-t border-lt-card-border">
        {filteredItems.map((item) => {
          const cartItem = cartItems.find((i) => i.mealId === item.id);
          const tagSlugs = item.dietaryTags
            ? item.dietaryTags.split(",").map((t) => t.trim())
            : [];

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 py-4 sm:gap-5 sm:py-5"
            >
              {/* Thumbnail */}
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
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-lt-warm-brown sm:text-lg">
                      {item.name}
                    </h3>
                    {item.portionSize && (
                      <p className="text-[11px] text-lt-charcoal/40">
                        {item.portionSize}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-base font-bold text-lt-terracotta sm:text-lg">
                      {formatCRC(item.price)}
                    </span>
                    {cartItem && (
                      <>
                        <span className="block text-xs font-semibold text-lt-warm-brown/60">
                          Sub: {formatCRC(Number(item.price) * cartItem.quantity)}
                        </span>
                        <span className="text-[10px] font-medium text-lt-olive-dark">
                          {cartItem.quantity} unid.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="mt-0.5 line-clamp-1 text-sm text-lt-charcoal/50 sm:mt-1">
                  {item.description}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Macros */}
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

                  {/* Dietary tags */}
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
                      onClick={() => removeItem(item.id)}
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
                        portionSize: item.portionSize || undefined,
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

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-4 text-lg font-medium text-lt-charcoal/60">
              No encontramos platillos con esos filtros
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveTags([]);
              }}
              className="mt-4 text-sm font-medium text-lt-terracotta hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
