"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus, Minus, Trash2, LogIn } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "@/components/CartProvider";
import ConfirmModal from "@/components/ConfirmModal";
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
  const [removeConfirmTarget, setRemoveConfirmTarget] = useState<string | null>(null);

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
    <div className="mx-auto max-w-7xl px-6 py-12">
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

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {filteredItems.map((item) => {
          const cartItem = cartItems.find((i) => i.mealId === item.id);
          const tagSlugs = item.dietaryTags
            ? item.dietaryTags.split(",").map((t) => t.trim())
            : [];

          return (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-lt-card-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-lt-green/5"
            >
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-lt-green/10 to-lt-terracotta/10">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 12.5vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-2xl opacity-30">🍽️</span>
                  </div>
                )}

                {/* Price badge */}
                <div className="absolute right-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 shadow-sm backdrop-blur-sm">
                  <span className="text-[11px] font-bold text-lt-terracotta">
                    {formatCRC(item.price)}
                  </span>
                </div>

                {/* Cart quantity badge */}
                {cartItem && (
                  <div className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-lt-green text-[9px] font-bold text-white shadow-md">
                    {cartItem.quantity}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-2 sm:p-2.5">
                <h3 className="text-xs font-bold leading-tight text-lt-warm-brown line-clamp-2 sm:text-sm">
                  {item.name}
                </h3>

                {item.portionSize && (
                  <p className="mt-0.5 text-[9px] text-lt-charcoal/40">
                    {item.portionSize}
                  </p>
                )}

                <p className="mt-0.5 line-clamp-1 text-[10px] text-lt-charcoal/50">
                  {item.description}
                </p>

                {/* Tags & macros */}
                <div className="mt-auto pt-1.5">
                  <div className="flex flex-wrap items-center gap-0.5">
                    {item.calories && (
                      <span className="text-[9px] text-lt-charcoal/40">
                        🔥{item.calories}
                      </span>
                    )}
                    {item.proteinG && (
                      <span className="text-[9px] text-lt-charcoal/40">
                        💪{item.proteinG}g
                      </span>
                    )}
                    {tagSlugs.slice(0, 1).map((slug) => {
                      const tag = tags.find((t) => t.slug === slug);
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-0.5 rounded-full bg-lt-green/8 px-1 py-0.5 text-[8px] font-medium text-lt-olive-dark"
                        >
                          {tag?.emoji && <span>{tag.emoji}</span>}
                          {tag?.name || slug}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Add to cart / quantity controls */}
              <div className="border-t border-lt-card-border p-2 sm:p-2.5">
                {!isSignedIn ? (
                  <Link
                    href="/auth/sign-in"
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-lt-terracotta/30 bg-lt-terracotta/5 py-1.5 text-[10px] font-semibold text-lt-terracotta transition-all hover:border-lt-terracotta hover:bg-lt-terracotta/10"
                  >
                    <LogIn className="h-3 w-3" />
                    Inicia sesión
                  </Link>
                ) : cartItem ? (
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => {
                        if (cartItem.quantity <= 1) {
                          setRemoveConfirmTarget(item.id);
                        } else {
                          updateQuantity(item.id, cartItem.quantity - 1);
                        }
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-lt-card-border text-lt-charcoal/50 transition-all hover:border-lt-terracotta/40 hover:text-lt-terracotta"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-lt-green/10 text-xs font-bold text-lt-green">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-lt-card-border text-lt-charcoal/50 transition-all hover:border-lt-terracotta/40 hover:text-lt-terracotta"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setRemoveConfirmTarget(item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-lt-charcoal/30 transition-all hover:bg-red-50 hover:text-red-400"
                      aria-label="Eliminar del carrito"
                    >
                      <Trash2 className="h-3 w-3" />
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
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-lt-terracotta py-1.5 text-[11px] font-semibold text-white shadow-sm shadow-lt-terracotta/20 transition-all hover:bg-lt-terracotta-dark active:scale-[0.98]"
                    aria-label="Agregar al carrito"
                  >
                    <Plus className="h-3 w-3" />
                    Agregar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
