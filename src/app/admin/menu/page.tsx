import { db } from "@/db";
import { meals, dietaryTags } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatCRC } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, UtensilsCrossed } from "lucide-react";
import DietaryTagBadge from "@/components/DietaryTagBadge";
import DeleteMealButton from "@/components/DeleteMealButton";
import BulkImportButton from "@/components/BulkImportButton";

export default async function AdminMenuPage() {
  const allMeals = await db
    .select()
    .from(meals)
    .orderBy(desc(meals.createdAt));

  const tags = await db.select().from(dietaryTags);

  return (
    <div>      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
            Platillos
          </h1>
          <p className="mt-1 text-sm text-lt-charcoal/60">
            Gestiona tu catálogo de platillos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BulkImportButton />
          <Link
            href="/admin/menu/new"
            className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark"
          >
            <Plus className="h-4 w-4" />
            Nuevo Platillo
          </Link>
        </div>
      </div>

      {allMeals.length === 0 ? (
        <div className="mt-16 text-center">
          <UtensilsCrossed className="mx-auto h-16 w-16 text-lt-cream-dark" />
          <p className="mt-4 text-lg font-medium text-lt-charcoal/60">
            No hay platillos creados aún
          </p>
          <Link
            href="/admin/menu/new"
            className="lt-btn mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Crear Primer Platillo
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {allMeals.map((meal) => {
            const tagSlugs = meal.dietaryTags
              ? meal.dietaryTags.split(",").map((t) => t.trim())
              : [];

            return (
              <div
                key={meal.id}
                className="flex items-center gap-4 rounded-2xl border border-lt-cream-dark bg-white p-5 transition-all hover:shadow-sm"
              >
                {/* Image */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lt-terracotta/10 to-lt-olive/10">
                  <span className="text-2xl">🍽️</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lt-warm-brown">{meal.name}</h3>
                    {!meal.isActive && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-lt-terracotta">
                    {formatCRC(meal.price)}
                  </p>
                  {meal.portionSize && (
                    <p className="text-xs text-lt-charcoal/50">
                      {meal.portionSize}
                    </p>
                  )}
                  {tagSlugs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tagSlugs.map((slug) => {
                        const tag = tags.find((t) => t.slug === slug);
                        return (
                          <DietaryTagBadge
                            key={slug}
                            slug={slug}
                            name={tag?.name || slug}
                            emoji={tag?.emoji || null}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/menu/${meal.id}/edit`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-lt-cream-dark text-lt-charcoal/50 transition-colors hover:border-lt-terracotta/30 hover:text-lt-terracotta"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteMealButton mealId={meal.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
