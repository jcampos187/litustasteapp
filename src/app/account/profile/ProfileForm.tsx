"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface UserProfile {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  deliveryAddress: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  dietaryNotes: string | null;
  profileComplete: boolean;
}

export default function ProfileForm() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    deliveryAddress: "",
    city: "",
    province: "",
    postalCode: "",
    dietaryNotes: "",
  });

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setFormData({
          name: data.name || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          deliveryAddress: data.deliveryAddress || "",
          city: data.city || "",
          province: data.province || "",
          postalCode: data.postalCode || "",
          dietaryNotes: data.dietaryNotes || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isSignedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-8">
        <div className="lt-skeleton h-8 w-48" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="lt-skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          Perfil actualizado correctamente
        </div>
      )}

      {profile && !profile.profileComplete && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <p className="font-medium">Completa tu perfil para poder ordenar</p>
          <p className="mt-1 text-amber-700/70">
            Necesitamos tu nombre, teléfono y dirección de entrega.
          </p>
        </div>
      )}

      {/* Personal Info */}
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-6 space-y-5">
        <h2 className="font-semibold text-lt-warm-brown">Información Personal</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Apellido *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-gray-50 px-4 py-2.5 text-sm text-lt-charcoal/50 outline-none"
            />
            <p className="mt-1 text-xs text-lt-charcoal/40">
              El correo no se puede cambiar
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Teléfono *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Ej: 8888-8888"
            />
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-6 space-y-5">
        <h2 className="font-semibold text-lt-warm-brown">Dirección de Entrega</h2>

        <div>
          <label className="block text-sm font-medium text-lt-charcoal/70">
            Dirección *
          </label>
          <input
            type="text"
            required
            value={formData.deliveryAddress}
            onChange={(e) => setFormData((p) => ({ ...p, deliveryAddress: e.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            placeholder="Calle, número, detalles de la casa"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Ciudad
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Ej: San José"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Provincia
            </label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData((p) => ({ ...p, province: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Ej: San José"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Código Postal
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData((p) => ({ ...p, postalCode: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Opcional"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
        <h2 className="font-semibold text-lt-warm-brown">Preferencias</h2>
        <div className="mt-4">
          <label className="block text-sm font-medium text-lt-charcoal/70">
            Notas Dietéticas o Alergias
          </label>
          <textarea
            rows={3}
            value={formData.dietaryNotes}
            onChange={(e) => setFormData((p) => ({ ...p, dietaryNotes: e.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
            placeholder="Alergias, preferencias alimenticias, etc."
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
