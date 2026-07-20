import { db } from "@/db";
import { orders, users, weeklyMenus } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getOrderStatusLabel } from "@/lib/utils";
import {
  ShoppingBag,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

async function getDashboardStats() {
  try {
    const orderResult = await db
      .select({ count: count() })
      .from(orders);
    const customerResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "customer"));

    const recentOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        createdAt: orders.createdAt,
        customerName: users.name,
        customerEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    const pendingResult = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const mealsCount = await db
      .select()
      .from(weeklyMenus)
      .where(
        and(
          eq(weeklyMenus.isPublished, true),
          eq(weeklyMenus.isArchived, false)
        )
      )
      .orderBy(desc(weeklyMenus.createdAt))
      .limit(1);

    return {
      totalOrders: (orderResult[0]?.count) || 0,
      totalCustomers: (customerResult[0]?.count) || 0,
      pendingOrders: (pendingResult[0]?.count) || 0,
      recentOrders,
      activeMenu: mealsCount[0] || null,
    };
  } catch {
    return {
      totalOrders: 0,
      totalCustomers: 0,
      pendingOrders: 0,
      recentOrders: [],
      activeMenu: null,
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Pedidos Totales",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "text-lt-terracotta bg-lt-terracotta/10",
      href: "/admin/orders",
    },
    {
      label: "Pedidos Pendientes",
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: "text-amber-600 bg-amber-100",
      href: "/admin/orders?status=pending",
    },
    {
      label: "Clientes Registrados",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-lt-olive-dark bg-lt-olive/10",
      href: "/admin/customers",
    },
    {
      label: "Menú Activo",
      value: stats.activeMenu ? stats.activeMenu.label : "Sin menú",
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-100",
      href: "/admin/weekly-menu",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Resumen de tu negocio
      </p>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-lt-cream-dark bg-white p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-lt-warm-brown">
              {typeof card.value === "number" ? card.value : card.value}
            </p>
            <p className="mt-1 text-sm text-lt-charcoal/60">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-lt-warm-brown">
            Pedidos Recientes
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-lt-terracotta hover:text-lt-terracotta-dark"
          >
            Ver todos →
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-lt-cream-dark bg-white">
          {stats.recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-lt-cream-dark" />
              <p className="mt-3 text-sm text-lt-charcoal/60">
                No hay pedidos aún
              </p>
            </div>
          ) : (
            <div className="divide-y divide-lt-cream-dark">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-lt-warm-brown">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-lt-charcoal/50">
                      {order.customerName || order.customerEmail || "Cliente"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-CR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
