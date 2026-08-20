"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface ApproveUserButtonProps {
  userId: string;
  action: "approve" | "decline";
  clerkId: string;
  userName?: string;
}

export default function ApproveUserButton({ userId, action, clerkId, userName }: ApproveUserButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, clerkId }),
      });

      if (!res.ok) throw new Error("Error");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (action === "approve") {
    return (
      <>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-xl bg-lt-olive/10 px-4 py-2 text-sm font-medium text-lt-olive-dark transition-all hover:bg-lt-olive/20 disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4" />
          Aprobar
        </button>
        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleClick}
          title="Aprobar Usuario"
          message={`¿Aprobar a ${userName ?? "este usuario"}? Podrá acceder al menú y hacer pedidos.`}
          confirmLabel="Aprobar"
          variant="info"
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
      >
        <XCircle className="h-4 w-4" />
        Rechazar
      </button>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleClick}
        title="Rechazar Usuario"
        message={`¿Rechazar a ${userName ?? "este usuario"}? No podrá acceder al sistema.`}
        confirmLabel="Rechazar"
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
}
