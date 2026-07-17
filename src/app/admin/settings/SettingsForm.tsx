"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface BusinessSettings {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
}

export default function SettingsForm({
  settings,
}: {
  settings: BusinessSettings | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: settings?.businessName || "Litus Taste",
    description: settings?.description || "",
    contactEmail: settings?.contactEmail || "",
    contactPhone: settings?.contactPhone || "",
    address: settings?.address || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/settings", {
        method: settings ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al guardar");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-6 space-y-5">
        <h2 className="font-semibold text-lt-warm-brown">
          Información del Negocio
        </h2>

        <div>
          <label className="block text-sm font-medium text-lt-charcoal/70">
            Nombre del Negocio
          </label>
          <input
            type="text"
            required
            value={formData.businessName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, businessName: e.target.value }))
            }
            className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-lt-charcoal/70">
            Descripción del Negocio
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
            className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            placeholder="Describe tu negocio de comida preparada..."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Correo de Contacto
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData((p) => ({ ...p, contactEmail: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, contactPhone: e.target.value }))
              }
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-lt-charcoal/70">
            Dirección
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData((p) => ({ ...p, address: e.target.value }))
            }
            className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            placeholder="Ciudad, provincia, Costa Rica"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
