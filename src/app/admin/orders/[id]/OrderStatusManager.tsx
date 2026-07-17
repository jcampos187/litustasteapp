"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { getOrderStatusLabel } from "@/lib/utils";

interface OrderStatusManagerProps {
  orderId: string;
  currentStatus: string;
  statuses: readonly string[];
}

export default function OrderStatusManager({
  orderId,
  currentStatus,
  statuses,
}: OrderStatusManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: string) => {
    if (status === currentStatus) return;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Error al actualizar");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2 rounded-xl border border-lt-cream-dark bg-white px-4 py-2 text-sm font-medium text-lt-charcoal/70 transition-all hover:border-lt-charcoal/30"
      >
        <span className="font-semibold">{getOrderStatusLabel(currentStatus)}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-lt-cream-dark bg-white p-1.5 shadow-xl">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50"
              >
                <span
                  className={
                    status === currentStatus
                      ? "font-medium text-lt-charcoal"
                      : "text-lt-charcoal/70"
                  }
                >
                  {getOrderStatusLabel(status)}
                </span>
                {status === currentStatus && (
                  <Check className="h-4 w-4 text-lt-terracotta" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
