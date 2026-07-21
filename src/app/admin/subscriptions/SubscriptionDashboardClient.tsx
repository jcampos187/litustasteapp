"use client";

import { useState } from "react";
import { Bell, BellOff, Send, Smartphone, RefreshCw, Loader2 } from "lucide-react";

interface RecentSubscription {
  id: string;
  endpoint: string;
  userAgent: string | null;
  createdAt: Date;
  userEmail: string | null;
  userName: string | null;
}

interface SubscriptionDashboardClientProps {
  totalSubscriptions: number;
  recentSubscriptions: RecentSubscription[];
}

export default function SubscriptionDashboardClient({
  totalSubscriptions,
  recentSubscriptions,
}: SubscriptionDashboardClientProps) {
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleSendTest = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/notify-menu", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setSendResult({
          type: "success",
          message: `Notificación enviada — ${data.pushNotified} dispositivos notificados${
            data.pushExpired > 0
              ? `, ${data.pushExpired} suscripciones expiradas`
              : ""
          }${data.emailNotified > 0 ? `, ${data.emailNotified} correos` : ""}`,
        });
      } else {
        const data = await res.json();
        setSendResult({
          type: "error",
          message: data.error || "Error al enviar notificación",
        });
      }
    } catch {
      setSendResult({
        type: "error",
        message: "Error de conexión",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Stats + Send Test Card */}
      <div className="rounded-2xl border border-lt-cream-dark bg-white p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-lt-green/10 p-3">
                <Bell className="h-6 w-6 text-lt-green" />
              </div>
              <div>
                <p className="text-3xl font-bold text-lt-warm-brown">
                  {totalSubscriptions}
                </p>
                <p className="text-sm text-lt-charcoal/60">
                  Dispositivos suscritos
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-lt-card-border px-4 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:border-lt-charcoal/30 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              onClick={handleSendTest}
              disabled={isSending || totalSubscriptions === 0}
              className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-lt-terracotta/90 disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar Notificación de Prueba
            </button>
          </div>
        </div>

        {/* Send result message */}
        {sendResult && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              sendResult.type === "success"
                ? "bg-lt-green/10 text-lt-green"
                : "bg-red-50 text-red-600"
            }`}
          >
            {sendResult.message}
          </div>
        )}
      </div>

      {/* Recent Subscriptions */}
      <div>
        <h2 className="text-lg font-bold text-lt-warm-brown">
          Suscripciones Recientes
        </h2>

        <div className="mt-4 rounded-2xl border border-lt-cream-dark bg-white">
          {recentSubscriptions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BellOff className="mx-auto h-10 w-10 text-lt-cream-dark" />
              <p className="mt-3 text-sm text-lt-charcoal/60">
                No hay suscripciones push activas
              </p>
            </div>
          ) : (
            <div className="divide-y divide-lt-cream-dark">
              {recentSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-lt-green/5 p-2">
                      <Smartphone className="h-4 w-4 text-lt-green" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-lt-warm-brown">
                        {sub.userName || sub.userEmail || "Usuario"}
                      </p>
                      <p className="text-xs text-lt-charcoal/50">
                        {sub.userAgent
                          ? sub.userAgent.slice(0, 60)
                          : "Dispositivo desconocido"}
                        {" · "}
                        {new Date(sub.createdAt).toLocaleDateString("es-CR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-lt-green/10 px-3 py-1 text-xs font-medium text-lt-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-lt-green" />
                    Activo
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
