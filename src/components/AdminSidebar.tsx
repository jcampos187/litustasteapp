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
  Bell,
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
    label: "Notificaciones",
    href: "/admin/subscriptions",
    icon: Bell,
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

  return (
    <>
      {/* Mobile hamburger toggle — fixed button in the content area */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-3 top-[5.5rem] z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-gray-300 shadow-lg ring-1 ring-white/10 transition-all hover:bg-gray-700 hover:text-white lg:hidden"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar — fixed overlay sliding from left, dark theme */}
      <aside
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-gray-900 shadow-2xl shadow-black/30 transition-transform duration-300 lg:hidden",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          userName={userName}
          userEmail={userEmail}
          dark
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>

      {/* Desktop sidebar — normal flex flow, light theme */}
      <aside
        className={cn(
          "hidden flex-col border-r border-lt-cream-dark bg-white transition-all duration-300 lg:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          userName={userName}
          userEmail={userEmail}
          dark={false}
        />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  pathname: string;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  userName: string;
  userEmail: string;
  dark: boolean;
  onNavClick?: () => void;
}

function SidebarContent({
  pathname,
  collapsed,
  setCollapsed,
  userName,
  userEmail,
  dark,
  onNavClick,
}: SidebarContentProps) {
  const t = (light: string, darkAlt: string) => (dark ? darkAlt : light);

  return (
    <>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between border-b px-4 py-4",
        t("border-lt-cream-dark", "border-white/10")
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lt-terracotta to-lt-gold text-xs font-bold text-white">
              LT
            </span>
            <span className={cn(
              "text-sm font-bold",
              t("text-lt-warm-brown", "text-gray-100")
            )}>Admin</span>
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
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
            t(
              "text-lt-charcoal/40 hover:bg-gray-100 hover:text-lt-charcoal",
              "text-gray-500 hover:bg-white/10 hover:text-gray-300"
            ),
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
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? t(
                      "bg-lt-terracotta/10 text-lt-terracotta",
                      "bg-lt-terracotta/20 text-lt-terracotta-light"
                    )
                  : t(
                      "text-lt-charcoal/60 hover:bg-gray-100 hover:text-lt-charcoal",
                      "text-gray-400 hover:bg-white/10 hover:text-gray-200"
                    ),
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
      <div className={cn(
        "border-t p-4",
        t("border-lt-cream-dark", "border-white/10"),
        collapsed && "px-2 py-4"
      )}>
        {!collapsed && (
          <div className="mb-3">
            <p className={cn(
              "truncate text-sm font-medium",
              t("text-lt-charcoal", "text-gray-200")
            )}>{userName}</p>
            <p className={cn(
              "truncate text-xs",
              t("text-lt-charcoal/40", "text-gray-500")
            )}>{userEmail}</p>
          </div>
        )}
        <SignOutButton>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all",
              t("hover:bg-red-50", "hover:bg-red-500/10"),
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
}
