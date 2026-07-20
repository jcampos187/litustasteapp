"use client";

import { useEffect } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Suspense } from "react";

function ConfirmationContent() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // Redirect guests to sign-in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-lt-charcoal/60">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-lt-warm-brown">
        ¡Pedido Recibido!
      </h1>

      {orderId && (
        <p className="mt-2 text-sm text-lt-charcoal/50">
          Pedido #{orderId.slice(0, 8)}
        </p>
      )}

      <p className="mt-4 text-lg text-lt-charcoal/60">
        Gracias por tu pedido. Te enviaremos un correo de confirmación
        pronto y nos pondremos en contacto para coordinar la entrega.
      </p>

      <div className="mt-8 rounded-2xl border border-lt-cream-dark bg-white p-6 text-left">
        <h3 className="font-semibold text-lt-warm-brown">¿Qué sigue?</h3>
        <ul className="mt-4 space-y-3 text-sm text-lt-charcoal/70">
          <li className="flex items-start gap-3">
            <span className="mt-0.5">📧</span>
            <span>Recibirás un correo de confirmación con los detalles de tu pedido.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5">📞</span>
            <span>Te contactaremos para coordinar la entrega y el método de pago.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5">🍽️</span>
            <span>¡Disfruta tus comidas! Recálienta y sirve.</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/account/orders"
          className="lt-btn inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold"
        >
          Ver Mis Pedidos
        </Link>
        <Link
          href="/menu"
          className="lt-btn-outline inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Menú
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
