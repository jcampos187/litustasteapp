"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface Meal {
  id: string;
  name: string;
  description: string;
  price: string;
  portionSize: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  dietaryTags: string | null;
  isActive: boolean;
}

interface DietaryTag {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
}

export default function EditMealForm({ meal, allTags }: { meal: Meal; allTags: DietaryTag[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: meal.name,
    description: meal.description,
    price: meal.price,
    portionSize: meal.portionSize || "",
    calories: meal.calories?.toString() || "",
    proteinG: meal.proteinG?.toString() || "",
    carbsG: meal.carbsG?.toString() || "",
    fatG: meal.fatG?.toString() || "",
    dietaryTags: meal.dietaryTags ? meal.dietaryTags.split(",").map((t) => t.trim()) : [],
    isActive: meal.isActive,
  });

  const toggleTag = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(slug)
        ? prev.dietaryTags.filter((t) => t !== slug)
        : [...prev.dietaryTags, slug],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/meals/${meal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          calories: formData.calories ? parseInt(formData.calories) : null,
          proteinG: formData.proteinG ? parseInt(formData.proteinG) : null,
          carbsG: formData.carbsG ? parseInt(formData.carbsG) : null,
          fatG: formData.fatG ? parseInt(formData.fatG) : null,
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar");
      router.push("/admin/menu");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link
        href="/admin/menu"
        className="mb-6 inline-flex items-center gap-1 text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a platillos
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Editar {meal.name}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-2xl">
        {/* Same form layout as new page */}
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6 space-y-5">
          <h2 className="font-semibold text-lt-warm-brown">Información Básica</h2>

          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">Nombre *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">Descripción</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">Precio (₡) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">Porción</label>
              <input
                type="text"
                value={formData.portionSize}
                onChange={(e) => setFormData((p) => ({ ...p, portionSize: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">Calorías</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData((p) => ({ ...p, calories: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6 space-y-5">
          <h2 className="font-semibold text-lt-warm-brown">Macros</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">Proteína (g)</label>
              <input
                type="number"
                value={formData.proteinG}
                onChange={(e) => setFormData((p) => ({ ...p, proteinG: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">Carbohidratos (g)</label>
              <input
                type="number"
                value={formData.carbsG}
                onChange={(e) => setFormData((p) => ({ ...p, carbsG: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">Grasa (g)</label>
              <input
                type="number"
                value={formData.fatG}
                onChange={(e) => setFormData((p) => ({ ...p, fatG: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
          <h2 className="font-semibold text-lt-warm-brown">Etiquetas Dietéticas</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag.slug}
                type="button"
                onClick={() => toggleTag(tag.slug)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                  formData.dietaryTags.includes(tag.slug)
                    ? "border-lt-terracotta bg-lt-terracotta text-white"
                    : "border-lt-cream-dark text-lt-charcoal/60 hover:border-lt-charcoal/30"
                }`}
              >
                {tag.emoji} {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active toggle */}
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-5 w-5 rounded border-lt-cream-dark text-lt-terracotta focus:ring-lt-terracotta"
            />
            <div>
              <span className="text-sm font-medium text-lt-charcoal">Platillo activo</span>
              <p className="text-xs text-lt-charcoal/50">Los platillos inactivos no aparecen en el menú semanal</p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/menu"
            className="rounded-xl border border-lt-cream-dark px-6 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.price}
            className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
