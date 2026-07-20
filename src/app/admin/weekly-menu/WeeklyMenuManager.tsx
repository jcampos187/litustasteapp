"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Save, Trash2, Send } from "lucide-react";
import { formatCRC } from "@/lib/utils";

interface Meal {
  id: string;
  name: string;
  price: string;
  dietaryTags: string | null;
}

interface WeeklyMenu {
  id: string;
  label: string;
  weekStart: Date;
  weekEnd: Date;
  orderCutoff: Date | null;
  publishAt: Date | null;
  isPublished: boolean;
}

interface DietaryTag {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
}

interface WeeklyMenuManagerProps {
  allMeals: Meal[];
  currentMenu: WeeklyMenu | null;
  menuItems: string[];
  tags: DietaryTag[];
}

export default function WeeklyMenuManager({
  allMeals,
  currentMenu,
  menuItems: initialMenuItems,
  tags,
}: WeeklyMenuManagerProps) {
  const router = useRouter();
  const [selectedMeals, setSelectedMeals] = useState<string[]>(initialMenuItems);
  const [isSaving, setIsSaving] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    label: currentMenu?.label || "",
    weekStart: currentMenu?.weekStart
      ? new Date(currentMenu.weekStart).toISOString().split("T")[0]
      : "",
    weekEnd: currentMenu?.weekEnd
      ? new Date(currentMenu.weekEnd).toISOString().split("T")[0]
      : "",
    orderCutoff: currentMenu?.orderCutoff
      ? new Date(currentMenu.orderCutoff).toISOString().slice(0, 16)
      : "",
    publishAt: currentMenu?.publishAt
      ? new Date(currentMenu.publishAt).toISOString().slice(0, 16)
      : "",
  });

  const toggleMeal = (mealId: string) => {
    setSelectedMeals((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleSave = async (publish: boolean) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/weekly-menu", {
        method: currentMenu ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: currentMenu?.id,
          mealIds: selectedMeals,
          publish,
          ...scheduleData,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!currentMenu) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/weekly-menu/${currentMenu.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al archivar");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotify = async () => {
    try {
      await fetch("/api/notify-menu", { method: "POST" });
      router.refresh();
    } catch {
      // Handle error
    }
  };

  return (
    <div className="space-y-8">
      {/* Schedule settings */}
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="flex items-center gap-2 text-sm font-semibold text-lt-charcoal/70"
        >
          <CalendarDays className="h-4 w-4" />
          {showSchedule ? "Ocultar" : "Mostrar"} configuración de fechas
        </button>

        {showSchedule && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 animate-fade-in-up">
            <div>
              <label className="block text-xs font-medium text-lt-charcoal/70">
                Nombre del menú
              </label>
              <input
                type="text"
                value={scheduleData.label}
                onChange={(e) =>
                  setScheduleData((p) => ({ ...p, label: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-lt-cream-dark px-3 py-2 text-sm outline-none focus:border-lt-terracotta"
                placeholder="Ej: Semana del 21-27 Julio"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-lt-charcoal/70">
                Inicio de semana
              </label>
              <input
                type="date"
                value={scheduleData.weekStart}
                onChange={(e) =>
                  setScheduleData((p) => ({ ...p, weekStart: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-lt-cream-dark px-3 py-2 text-sm outline-none focus:border-lt-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-lt-charcoal/70">
                Fin de semana
              </label>
              <input
                type="date"
                value={scheduleData.weekEnd}
                onChange={(e) =>
                  setScheduleData((p) => ({ ...p, weekEnd: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-lt-cream-dark px-3 py-2 text-sm outline-none focus:border-lt-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-lt-charcoal/70">
                Fecha de corte (opcional)
              </label>
              <input
                type="datetime-local"
                value={scheduleData.orderCutoff}
                onChange={(e) =>
                  setScheduleData((p) => ({ ...p, orderCutoff: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-lt-cream-dark px-3 py-2 text-sm outline-none focus:border-lt-terracotta"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-lt-charcoal/70">
                Publicar automáticamente (opcional)
              </label>
              <input
                type="datetime-local"
                value={scheduleData.publishAt}
                onChange={(e) =>
                  setScheduleData((p) => ({ ...p, publishAt: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-lt-cream-dark px-3 py-2 text-sm outline-none focus:border-lt-terracotta"
              />
            </div>
          </div>
        )}
      </div>

      {/* Meal Selection */}
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
        <h2 className="font-semibold text-lt-warm-brown">
          Seleccionar Platillos
        </h2>
        <p className="mt-1 text-sm text-lt-charcoal/50">
          Elige los platillos que estarán disponibles esta semana
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allMeals.map((meal) => {
            const isSelected = selectedMeals.includes(meal.id);
            const tagSlugs = meal.dietaryTags
              ? meal.dietaryTags.split(",").map((t) => t.trim())
              : [];

            return (
              <button
                key={meal.id}
                type="button"
                onClick={() => toggleMeal(meal.id)}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-lt-terracotta bg-lt-terracotta/5"
                    : "border-lt-cream-dark hover:border-lt-charcoal/20"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-lt-terracotta bg-lt-terracotta text-white"
                      : "border-lt-cream-dark"
                  }`}
                >
                  {isSelected && <span className="text-xs">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-lt-warm-brown truncate">
                    {meal.name}
                  </p>
                  <p className="text-xs font-semibold text-lt-terracotta">
                    {formatCRC(meal.price)}
                  </p>
                  {tagSlugs.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tagSlugs.map((slug) => {
                        const tag = tags.find((t) => t.slug === slug);
                        return (
                          <span key={slug} className="text-xs text-lt-charcoal/50">
                            {tag?.emoji} {tag?.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {allMeals.length === 0 && (
            <div className="col-span-full py-8 text-center">
              <p className="text-sm text-lt-charcoal/60">
                No hay platillos activos. Crea platillos primero.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-lt-charcoal/50">
          {selectedMeals.length} platillo{selectedMeals.length !== 1 ? "s" : ""} seleccionado
          {selectedMeals.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving || selectedMeals.length === 0}
            className="flex items-center gap-2 rounded-xl border border-lt-cream-dark bg-white px-5 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:border-lt-charcoal/30 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Guardar Borrador
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving || selectedMeals.length === 0}
            className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
          >
            <CalendarDays className="h-4 w-4" />
            {currentMenu?.isPublished ? "Actualizar" : "Publicar Menú"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {currentMenu?.isPublished && (
            <button
              onClick={handleNotify}
              className="flex items-center gap-2 rounded-xl border border-lt-olive/30 bg-lt-olive/5 px-5 py-2.5 text-sm font-medium text-lt-olive-dark transition-all hover:bg-lt-olive/10"
            >
              <Send className="h-4 w-4" />
              Notificar Clientes
            </button>
          )}
          {currentMenu && (
            <button
              onClick={handleArchive}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Archivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
