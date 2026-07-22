"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    city: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrarse");
      }

      // Redirect to pending approval page
      router.push("/auth/pending-approval");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg items-center justify-center px-6 py-12">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-lt-warm-brown">Crear Cuenta</h1>
          <p className="mt-1 text-sm text-lt-charcoal/60">
            Regístrate para ordenar tu menú semanal
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Last Name */}
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
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
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
                className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Teléfono *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Ej: 8888-8888"
            />
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Dirección de Entrega *
            </label>
            <input
              type="text"
              required
              value={formData.deliveryAddress}
              onChange={(e) => setFormData((p) => ({ ...p, deliveryAddress: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Calle, número, detalles"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Ciudad
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              placeholder="Ej: San José"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-lt-charcoal/70">
              Contraseña *
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-xl border border-lt-cream-dark bg-white px-4 py-3 pr-11 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lt-charcoal/40 hover:text-lt-charcoal/60"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-lt-terracotta py-3.5 font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando cuenta...
              </span>
            ) : (
              "Crear Cuenta"
            )}
          </button>

          <p className="text-center text-sm text-lt-charcoal/50">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/sign-in" className="font-medium text-lt-terracotta hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
