"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteMealButtonProps {
  mealId: string;
}

export default function DeleteMealButton({ mealId }: DeleteMealButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-lt-cream-dark text-lt-charcoal/50 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-lt-cream-dark bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-lt-warm-brown">Eliminar Platillo</h3>
            <p className="mt-2 text-sm text-lt-charcoal/60">
              ¿Estás seguro de eliminar este platillo? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-lt-cream-dark px-4 py-2 text-sm font-medium text-lt-charcoal/70 transition-all hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
