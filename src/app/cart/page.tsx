"use client";

import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Clock } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatCRC } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [profileComplete, setProfileComplete] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);
  const [isApproved, setIsApproved] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [removeConfirmTarget, setRemoveConfirmTarget] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Redirect guests to sign-in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Check if user has completed their profile and is approved
  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfileComplete(data.profileComplete || false);
        setIsApproved(data.isActive || false);
        setProfileChecked(true);
      })
      .catch(() => setProfileChecked(true));
  }, [isSignedIn]);

  const handleConfirmOrder = async () => {
    if (!isSignedIn) {
      router.push("/auth/sign-in");
      return;
    }

    if (items.length === 0) return;

    setIsSubmitting(true);
    setError("");
    setShowConfirm(false);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            mealId: i.mealId,
            mealName: i.mealName,
            quantity: i.quantity,
            unitPrice: i.price,
          })),
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar el pedido");
      }

      const order = await res.json();
      clearCart();
      router.push(`/order/confirmation?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    if (!isSignedIn) {
      router.push("/auth/sign-in");
      return;
    }

    if (items.length === 0) return;

    // Check profile completion
    if (!profileComplete) {
      setError("Completa tu perfil antes de ordenar. Necesitamos tu nombre, teléfono y dirección de entrega.");
      return;
    }

    // Check if approved
    if (!isApproved) {
      setError("Tu cuenta está pendiente de aprobación. Espera a que el administrador la active.");
      return;
    }

    // Show confirmation modal
    setShowConfirm(true);
  };

  const handleRemoveConfirm = (mealId: string) => {
    setRemoveConfirmTarget(mealId);
  };

  const handleDecrement = (mealId: string, currentQty: number) => {
    if (currentQty <= 1) {
      // Show confirmation before removing at qty=1
      setRemoveConfirmTarget(mealId);
    } else {
      updateQuantity(mealId, currentQty - 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <ShoppingBag className="mx-auto h-20 w-20 text-lt-cream-dark" />
        <h1 className="mt-6 text-2xl font-bold text-lt-warm-brown">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-lt-charcoal/60">
          Agrega platillos del menú semanal para comenzar tu pedido.
        </p>
        <Link
          href="/menu"
          className="lt-btn mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver Menú Semanal
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-lt-warm-brown">
            Tu Carrito
          </h1>
          <p className="mt-1 text-lt-charcoal/60">
            Revisa tu pedido antes de enviarlo
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-sm font-medium text-lt-charcoal/50 transition-colors hover:text-red-500"
          >
            Vaciar carrito
          </button>
          <Link
            href="/menu"
            className="text-sm font-medium text-lt-terracotta hover:text-lt-terracotta-dark"
          >
            + Seguir agregando
          </Link>
        </div>
      </div>

      {/* Profile incomplete banner */}
      {isSignedIn && !profileComplete && profileChecked && (
        <div className="mt-6">
          <ProfileCompletionBanner />
        </div>
      )}

      {/* Pending approval banner */}
      {isSignedIn && profileChecked && !isApproved && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Cuenta pendiente de aprobación</p>
              <p className="mt-1 text-sm text-amber-700/70">
                El administrador debe aprobar tu cuenta antes de que puedas realizar pedidos.
                Te notificaremos cuando sea activada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Items */}
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.mealId}
            className="flex items-center gap-4 rounded-2xl border border-lt-cream-dark bg-white p-5"
          >
            {/* Image */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lt-terracotta/10 to-lt-olive/10">
              <span className="text-2xl">🍽️</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lt-warm-brown">{item.mealName}</h3>
              <p className="text-sm font-semibold text-lt-terracotta">
                {formatCRC(item.price)} c/u
              </p>
              <p className="mt-1 text-sm text-lt-charcoal/50">
                Subtotal: {formatCRC(item.price * item.quantity)}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecrement(item.mealId, item.quantity)}
                className="lt-qty-btn"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center rounded-lg border border-lt-cream-dark bg-white text-sm font-bold">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.mealId, item.quantity + 1)}
                className="lt-qty-btn"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={() => handleRemoveConfirm(item.mealId)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lt-charcoal/40 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-lt-charcoal/70">
          Notas para tu pedido (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Alergias, preferencias, o cualquier comentario..."
          rows={3}
          className="mt-2 w-full rounded-xl border border-lt-cream-dark bg-white p-4 text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
        />
      </div>

      {/* Summary + Submit */}
      <div className="mt-8 rounded-2xl border border-lt-cream-dark bg-white p-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-lt-charcoal">Total</span>
          <span className="text-3xl font-bold text-lt-terracotta">
            {formatCRC(totalPrice)}
          </span>
        </div>

        <button
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-lt-terracotta py-4 font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando pedido...
            </span>
          ) : (
            "Enviar Pedido"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-lt-charcoal/40">
          No hay pagos en línea. Te contactaremos para coordinar la entrega y el pago.
        </p>
      </div>

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1 text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
        >
          <ArrowLeft className="h-4 w-4" />
          Seguir viendo el menú
        </Link>
      </div>

      {/* ── Confirmación de pedido ── */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmOrder}
        title="Confirmar Pedido"
        message="¿Estás seguro de enviar este pedido? Una vez enviado, te contactaremos para coordinar la entrega y el pago."
        confirmLabel={isSubmitting ? "Enviando..." : "Sí, enviar pedido"}
        cancelLabel="Revisar de nuevo"
        isLoading={isSubmitting}
        variant="info"
        items={items}
        totalPrice={totalPrice}
      />

      {/* ── Confirmación de eliminar artículo ── */}
      <ConfirmModal
        isOpen={removeConfirmTarget !== null}
        onClose={() => setRemoveConfirmTarget(null)}
        onConfirm={() => {
          if (removeConfirmTarget) {
            removeItem(removeConfirmTarget);
            setRemoveConfirmTarget(null);
          }
        }}
        title="Eliminar Artículo"
        message="¿Estás seguro de eliminar este artículo de tu carrito?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />

      {/* ── Confirmación de vaciar carrito ── */}
      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearCart();
          setShowClearConfirm(false);
        }}
        title="Vaciar Carrito"
        message="¿Estás seguro de vaciar todo el carrito? Se eliminarán todos los artículos."
        confirmLabel="Sí, vaciar carrito"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
}
