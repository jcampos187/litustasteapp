"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface PushSubscriptionInfo {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export default function PushSubscribeButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingSub, setExistingSub] = useState<PushSubscriptionInfo | null>(
    null
  );

  // Determine if push is supported (computed once, not state)
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const rawKey = sub.getKey("p256dh");
        const rawAuth = sub.getKey("auth");
        setExistingSub({
          endpoint: sub.endpoint,
          p256dh: rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : "",
          auth: rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : "",
        });
        setIsSubscribed(true);
      }
    });
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured");
        setIsLoading(false);
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const rawKey = sub.getKey("p256dh");
      const rawAuth = sub.getKey("auth");

      const subscriptionData: PushSubscriptionInfo = {
        endpoint: sub.endpoint,
        p256dh: rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : "",
        auth: rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : "",
      };

      // Save to server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      if (res.ok) {
        setIsSubscribed(true);
        setExistingSub(subscriptionData);
      }
    } catch (err) {
      console.error("Failed to subscribe to push:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();
      }

      if (existingSub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existingSub.endpoint }),
        });
      }

      setIsSubscribed(false);
      setExistingSub(null);
    } catch (err) {
      console.error("Failed to unsubscribe from push:", err);
    } finally {
      setIsLoading(false);
    }
  }, [existingSub]);

  if (!isSupported) return null;

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 ${
        isSubscribed
          ? "border-lt-green/30 bg-lt-green/5 text-lt-green hover:bg-lt-green/10"
          : "border-lt-card-border text-lt-charcoal/70 hover:border-lt-terracotta/30 hover:text-lt-terracotta"
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {isSubscribed ? "Notificaciones Activadas" : "Activar Notificaciones"}
    </button>
  );
}

/**
 * Convert a base64url string to a Uint8Array (required by pushManager.subscribe).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
