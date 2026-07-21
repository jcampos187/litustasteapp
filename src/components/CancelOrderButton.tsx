"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface CancelOrderButtonProps {
  orderId: string;
  orderStatus: string;
  /** If true, shows a full-width block variant instead of inline */
  block?: boolean;
}

export default function CancelOrderButton({
  orderId,
  orderStatus,
  block = false,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for pending orders
  if (orderStatus !== "pending") return null;

  const handleCancel = async () => {
    setIsCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al cancelar el pedido");
      }
    } catch {
      setError("Error de conexión al cancelar el pedido");
    } finally {
      setIsCancelling(false);
      setShowConfirm(false);
    }
  };

  const baseClasses = block
    ? "flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
    : "flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 hover:border-red-300 disabled:opacity-50";

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isCancelling}
        className={baseClasses}
      >
        <XCircle className="h-4 w-4" />
        {isCancelling ? "Cancelando..." : "Cancelar Pedido"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCancel}
        title="Cancelar Pedido"
        message="¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="No, mantener"
        variant="danger"
      />
    </>
  );
}
