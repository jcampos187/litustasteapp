"use client";

import { useState } from "react";
import { Send, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar invitación");
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar invitación");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-lt-warm-brown">
          ¡Invitación Enviada!
        </h2>
        <p className="mt-2 text-sm text-lt-charcoal/60">
          El cliente recibirá un correo con el enlace para crear su cuenta.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setSuccess(false)}
            className="rounded-xl border border-lt-cream-dark px-5 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:bg-gray-50"
          >
            Invitar Otro
          </button>
          <Link
            href="/admin/customers"
            className="rounded-xl bg-lt-terracotta px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark"
          >
            Ver Clientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/customers"
        className="mb-6 inline-flex items-center gap-1 text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Invitar Cliente
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Envía una invitación por correo para que el cliente cree su cuenta
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 max-w-md">
        <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
          <label className="block text-sm font-medium text-lt-charcoal/70">
            Correo Electrónico del Cliente
          </label>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lt-charcoal/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full rounded-xl border border-lt-cream-dark bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-lt-cream p-4">
            <p className="text-xs text-lt-charcoal/50">
              El cliente recibirá un correo con un enlace único para crear su
              cuenta. El enlace expira después de 7 días.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-lt-terracotta py-3 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Enviar Invitación"}
          </button>
        </div>
      </form>
    </div>
  );
}
