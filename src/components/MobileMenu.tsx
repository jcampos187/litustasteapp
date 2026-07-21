"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ShoppingBag, LogOut, ShieldCheck } from "lucide-react";

interface MobileMenuProps {
  isAdmin?: boolean;
}

export default function MobileMenu({ isAdmin = false }: MobileMenuProps) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on route change (intentional: close menu on every navigation)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const initial = user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "?";

  return (
    <div className="md:hidden" ref={menuRef}>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-lt-card-border bg-white transition-all hover:border-lt-green/30 hover:bg-lt-green/5"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-lt-charcoal/70" />
        ) : (
          <Menu className="h-5 w-5 text-lt-charcoal/70" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding menu panel — darkest theme */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-[300px] max-w-[85vw] bg-black shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Close button at top */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-[family-name:var(--font-display)] text-base font-semibold text-white">
              Menú
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User info (if signed in) */}
          {isSignedIn && user && (
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lt-terracotta to-lt-gold text-sm font-bold text-white">
                {initial.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-100">
                  {user.firstName
                    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
                    : "Usuario"}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              Navegación
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-lt-green-light"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/menu"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-lt-green-light"
              onClick={() => setIsOpen(false)}
            >
              Menú Semanal
            </Link>

            {isSignedIn && (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Mi Cuenta
                  </p>
                </div>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-lt-terracotta-light"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-lt-terracotta-light"
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Mis Pedidos
                </Link>

                {/* Admin link — only for admins */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/10 hover:text-amber-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Panel Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Bottom: Auth buttons */}
          <div className="border-t border-white/10 p-4">
            {isSignedIn ? (
              <SignOutButton>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-red-400">
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </SignOutButton>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/sign-in"
                  className="flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-lt-green-light/30 hover:text-lt-green-light"
                  onClick={() => setIsOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="flex w-full items-center justify-center rounded-xl bg-lt-green-mid px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-lt-green"
                  onClick={() => setIsOpen(false)}
                >
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
