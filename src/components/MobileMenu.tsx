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

      {/* Sliding menu panel — premium dark glassmorphism */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[300px] max-w-[85vw] flex-col bg-gradient-to-b from-lt-dark-light via-lt-dark to-lt-dark shadow-2xl shadow-black/60 transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top accent gradient line */}
        <div className="h-1 shrink-0 bg-gradient-to-r from-lt-green via-lt-terracotta to-lt-gold" />

        {/* Close button + branding */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Litus Taste"
              className="h-9 w-9 rounded-lg object-contain ring-1 ring-white/10"
            />
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-display)] text-base font-semibold leading-tight tracking-tight text-white">
                Litus <span className="text-lt-green-light">Taste</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info (if signed in) */}
        {isSignedIn && user && (
          <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lt-terracotta to-lt-gold text-sm font-bold text-white shadow-lg shadow-lt-terracotta/20">
              {initial.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.firstName
                  ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
                  : "Usuario"}
              </p>
              <p className="truncate text-xs text-white/50">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 py-2">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">
            Navegación
          </p>
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-white/10 hover:text-white ${
              pathname === "/" ? "bg-white/10 text-white" : "text-white/60"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Inicio
          </Link>
          <Link
            href="/menu"
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-white/10 hover:text-white ${
              pathname === "/menu" ? "bg-white/10 text-white" : "text-white/60"
            }`}
            onClick={() => setIsOpen(false)}
          >
            Menú Semanal
          </Link>

          {isSignedIn && (
            <>
              <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30">
                Mi Cuenta
              </p>
              <Link
                href="/account/profile"
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-white/10 hover:text-white ${
                  pathname.startsWith("/account/profile") ? "bg-white/10 text-white" : "text-white/60"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 opacity-70" />
                Mi Perfil
              </Link>
              <Link
                href="/account/orders"
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-white/10 hover:text-white ${
                  pathname.startsWith("/account/orders") ? "bg-white/10 text-white" : "text-white/60"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag className="h-4 w-4 opacity-70" />
                Mis Pedidos
              </Link>

              {/* Admin link — only for admins */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-amber-500/10 hover:text-amber-300 ${
                    pathname.startsWith("/admin") ? "bg-amber-500/10 text-amber-300" : "text-amber-200/70"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4 opacity-70" />
                  Panel Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Bottom: Auth buttons */}
        <div className="border-t border-white/5 px-4 py-4">
          {isSignedIn ? (
            <SignOutButton>
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition-all hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </SignOutButton>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/sign-in"
                className="flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition-all hover:border-lt-green-light/40 hover:bg-white/5 hover:text-lt-green-light"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/sign-up"
                className="flex w-full items-center justify-center rounded-xl bg-lt-green-mid px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-lt-green/20 transition-all hover:bg-lt-green hover:shadow-xl hover:shadow-lt-green/30"
                onClick={() => setIsOpen(false)}
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
