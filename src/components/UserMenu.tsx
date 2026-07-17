"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function UserMenu() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  // Close on route change (intentional: close dropdown on every navigation)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  const initial = user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "?";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-lt-cream-dark bg-white px-3 py-2 transition-all hover:border-lt-terracotta/30 hover:bg-lt-terracotta/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-lt-terracotta to-lt-gold text-xs font-bold text-white">
          {initial.toUpperCase()}
        </div>
        <span className="hidden text-sm font-medium text-lt-charcoal/80 lg:block max-w-[120px] truncate">
          {user?.firstName || user?.emailAddresses[0]?.emailAddress}
        </span>
        <ChevronDown className={`h-4 w-4 text-lt-charcoal/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 animate-fade-in-up rounded-2xl border border-lt-cream-dark bg-white p-1.5 shadow-xl">
          {/* User info header */}
          <div className="px-3 py-2.5 border-b border-lt-cream-dark mb-1">
            <p className="text-sm font-medium text-lt-warm-brown truncate">
              {user?.firstName
                ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
                : "Usuario"}
            </p>
            <p className="text-xs text-lt-charcoal/50 truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>

          {/* Menu items */}
          <Link
            href="/account/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-lt-charcoal/70 transition-colors hover:bg-lt-terracotta/5 hover:text-lt-terracotta"
          >
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-lt-charcoal/70 transition-colors hover:bg-lt-terracotta/5 hover:text-lt-terracotta"
          >
            <ShoppingBag className="h-4 w-4" />
            Mis Pedidos
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-lt-charcoal/70 transition-colors hover:bg-lt-terracotta/5 hover:text-lt-terracotta"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin Panel
          </Link>

          <div className="border-t border-lt-cream-dark mt-1 pt-1">
            <SignOutButton>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
}
