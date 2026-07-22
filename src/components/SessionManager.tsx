"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * Manages session lifecycle:
 * - Signs the user out when the browser/tab is closed (pagehide event).
 * - Stores a session marker in sessionStorage — if it's missing on load,
 *   it means the browser was closed and the session needs cleanup.
 *
 * This component does not render anything — it's a pure side-effect hook.
 */
export default function SessionManager() {
  const { signOut, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const SESSION_KEY = "lt_session_active";

    // Check if this is a fresh browser session (sessionStorage was cleared)
    const hadSession = sessionStorage.getItem(SESSION_KEY);

    if (!hadSession && isSignedIn) {
      // Browser was closed since last visit — clean up stale session
      signOut({ redirectUrl: "/" }).catch(() => {});
      return;
    }

    // Mark session as active (cleared when browser/tab closes)
    sessionStorage.setItem(SESSION_KEY, "1");

    // Sign out when the tab/browser is closed
    const handlePageHide = () => {
      // Use sendBeacon-compatible approach — fire and forget
      signOut({ redirectUrl: "/" }).catch(() => {});
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [isLoaded, isSignedIn, signOut]);

  return null;
}
