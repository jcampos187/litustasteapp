"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Calendar,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userName: string;
  userEmail: string;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Platillos",
    href: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "Menú Semanal",
    href: "/admin/weekly-menu",
    icon: Calendar,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Aprobaciones",
    href: "/admin/approvals",
    icon: Users,
  },
  {
    label: "Clientes",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Configuración",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-lt-cream-dark px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lt-terracotta to-lt-gold text-xs font-bold text-white">
              LT
            </span>
            <span className="text-sm font-bold text-lt-warm-brown">Admin</span>
          </div>
        )}
        {collapsed && (
          <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lt-terracotta to-lt-gold text-xs font-bold text-white">
            LT
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg text-lt-charcoal/40 transition-colors hover:bg-gray-100 hover:text-lt-charcoal",
            collapsed && "mx-auto mt-2"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)} // close mobile sidebar on nav
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-lt-terracotta/10 text-lt-terracotta"
                  : "text-lt-charcoal/60 hover:bg-gray-100 hover:text-lt-charcoal",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className={cn("border-t border-lt-cream-dark p-4", collapsed && "px-2 py-4")}>
        {!collapsed && (
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-lt-charcoal">
              {userName}
            </p>
            <p className="truncate text-xs text-lt-charcoal/40">{userEmail}</p>
          </div>
        )}
        <SignOutButton>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50",
              collapsed && "justify-center px-2"
            )}
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </SignOutButton>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger toggle — fixed button in the content area */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-3 top-[5.5rem] z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/5 transition-all hover:shadow-lg lg:hidden"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          <X className="h-4 w-4 text-lt-charcoal/70" />
        ) : (
          <Menu className="h-4 w-4 text-lt-charcoal/70" />
        )}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar — fixed overlay sliding from left */}
      <aside
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-lt-cream-dark bg-white shadow-2xl transition-transform duration-300 lg:hidden",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar — normal flex flow */}
      <aside
        className={cn(
          "hidden flex-col border-r border-lt-cream-dark bg-white transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
