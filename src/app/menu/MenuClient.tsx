"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import MealCard from "@/components/MealCard";

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
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <MealCard
            key={item.id}
            meal={item}
            tags={tags}
          />
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center">
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
