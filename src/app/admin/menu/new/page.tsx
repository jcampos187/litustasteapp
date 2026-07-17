"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewMealPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    portionSize: "",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    dietaryTags: [] as string[],
  });

  const allTags = [
    { slug: "vegan", name: "Vegano", emoji: "🌱" },
    { slug: "vegetarian", name: "Vegetariano", emoji: "🥦" },
    { slug: "gluten-free", name: "Sin Gluten", emoji: "🌾" },
    { slug: "keto", name: "Keto", emoji: "🥑" },
    { slug: "high-protein", name: "Alta Proteína", emoji: "💪" },
    { slug: "low-carb", name: "Bajos Carbohidratos", emoji: "🥗" },
    { slug: "dairy-free", name: "Sin Lácteos", emoji: "🧀" },
    { slug: "sugar-free", name: "Sin Azúcar", emoji: "🍬" },
  ];

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
      const res = await fetch("/api/meals", {
        method: "POST",
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

      if (!res.ok) throw new Error("Error al crear platillo");
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
        Nuevo Platillo
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Agrega un nuevo platillo al catálogo
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8 max-w-2xl">
        {/* Basic Info */}
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6 space-y-5">
          <h2 className="font-semibold text-lt-warm-brown">Información Básica</h2>

          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Nombre del Platillo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Ej: Pollo al Curry con Arroz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Descripción
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Describe los ingredientes y el sabor..."
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">
                Precio (₡) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
                placeholder="₡ 5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">
                Porción
              </label>
              <input
                type="text"
                value={formData.portionSize}
                onChange={(e) => setFormData((p) => ({ ...p, portionSize: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
                placeholder="Ej: 400g, 1 porción"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">
                Calorías
              </label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData((p) => ({ ...p, calories: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
                placeholder="Ej: 450"
              />
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6 space-y-5">
          <h2 className="font-semibold text-lt-warm-brown">Macros (opcional)</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">
                Proteína (g)
              </label>
              <input
                type="number"
                value={formData.proteinG}
                onChange={(e) => setFormData((p) => ({ ...p, proteinG: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">
                Carbohidratos (g)
              </label>
              <input
                type="number"
                value={formData.carbsG}
                onChange={(e) => setFormData((p) => ({ ...p, carbsG: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-lt-charcoal/70">
                Grasa (g)
              </label>
              <input
                type="number"
                value={formData.fatG}
                onChange={(e) => setFormData((p) => ({ ...p, fatG: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
          <h2 className="font-semibold text-lt-warm-brown">Etiquetas Dietéticas</h2>
          <p className="mt-1 text-sm text-lt-charcoal/50">
            Selecciona las etiquetas que aplican a este platillo
          </p>
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
            {isSubmitting ? "Guardando..." : "Guardar Platillo"}
          </button>
        </div>
      </form>
    </div>
  );
}
