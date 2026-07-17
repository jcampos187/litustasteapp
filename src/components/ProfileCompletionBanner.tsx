"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProfileCompletionBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium text-amber-800">
            Completa tu perfil para ordenar
          </p>
          <p className="mt-1 text-sm text-amber-700/70">
            Necesitamos tu nombre, teléfono y dirección de entrega para procesar
            tus pedidos.
          </p>
          <Link
            href="/account/profile"
            className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-amber-700"
          >
            Completar Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
