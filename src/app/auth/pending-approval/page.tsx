import { Clock } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-10 w-10 text-amber-600" />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-lt-warm-brown">
        ¡Registro Exitoso!
      </h1>

      <p className="mt-4 text-lg text-lt-charcoal/60">
        Tu cuenta está pendiente de aprobación por el administrador.
        Te notificaremos cuando sea activada.
      </p>

      <div className="mt-8 rounded-2xl border border-lt-cream-dark bg-white p-6 text-left">
        <h3 className="font-semibold text-lt-warm-brown">¿Qué sigue?</h3>
        <ul className="mt-4 space-y-3 text-sm text-lt-charcoal/70">
          <li className="flex items-start gap-3">
            <span className="mt-0.5">📧</span>
            <span>Recibirás un correo cuando el administrador apruebe tu cuenta.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5">🔐</span>
            <span>Una vez aprobado, inicia sesión con tu correo y contraseña.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5">🍽️</span>
            <span>Podrás ver el menú semanal y hacer tus pedidos.</span>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <Link
          href="/auth/sign-in"
          className="lt-btn inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
