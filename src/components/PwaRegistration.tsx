"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA support (offline caching, install prompt).
 * Only runs on the client (browser) after the first render.
 */
export default function PwaRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      // Register only after the page is fully loaded
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
      });
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
