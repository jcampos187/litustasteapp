"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import UserMenu from "./UserMenu";

interface DesktopAuthProps {
  isAdmin: boolean;
}

export default function DesktopAuth({ isAdmin }: DesktopAuthProps) {
  const { isSignedIn, isLoaded } = useAuth();

  // Show nothing during initial load to prevent flash
  if (!isLoaded) return <div className="h-10 w-40 rounded-lg bg-lt-card-border/50 animate-pulse" />;

  if (isSignedIn) {
    return <UserMenu isAdmin={isAdmin} />;
  }

  return (
    <Link
      href="/auth/sign-in"
      className="rounded-lg border border-lt-card-border px-5 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:border-lt-green/30 hover:text-lt-green"
    >
      Iniciar Sesión
    </Link>
  );
}
