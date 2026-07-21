import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, users, weeklyMenus } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { formatCRC, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { Package } from "lucide-react";
import Link from "next/link";
import CancelOrderButton from "@/components/CancelOrderButton";

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser) redirect("/auth/sign-in");

  const userOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      notes: orders.notes,
      createdAt: orders.createdAt,
      weeklyMenuLabel: weeklyMenus.label,
    })
    .from(orders)
    .leftJoin(weeklyMenus, eq(orders.weeklyMenuId, weeklyMenus.id))
    .where(eq(orders.customerId, dbUser.id))
    .orderBy(desc(orders.createdAt));

  // Fetch all order items in one query, grouped by orderId
  const orderIds = userOrders.map((o) => o.id);
  const allItems = orderIds.length > 0
    ? await db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds))
    : [];

  const itemsByOrderId = allItems.reduce<Record<string, typeof allItems>>(
    (acc, item) => {
      if (!acc[item.orderId]) acc[item.orderId] = [];
      acc[item.orderId].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-lt-warm-brown">
            Mis Pedidos
          </h1>
          <p className="mt-1 text-lt-charcoal/60">
            Historial de tus pedidos
          </p>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <div className="mt-16 text-center">
          <Package className="mx-auto h-16 w-16 text-lt-cream-dark" />
          <p className="mt-4 text-lg font-medium text-lt-charcoal/60">
            No tienes pedidos aún
          </p>
          <Link
            href="/menu"
            className="lt-btn mt-6 inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold"
          >
            Ver Menú Semanal
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {userOrders.map((order) => {
            const items = itemsByOrderId[order.id] || [];
            const total = items.reduce(
              (sum, i) => sum + Number(i.unitPrice) * i.quantity,
              0
            );

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-lt-cream-dark bg-white transition-all hover:border-lt-terracotta/20 hover:shadow-md"
              >
                <Link
                  href={`/account/orders/${order.id}`}
                  className="block p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lt-warm-brown">
                        Pedido #{order.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-sm text-lt-charcoal/50">
                        {new Date(order.createdAt).toLocaleDateString("es-CR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {order.weeklyMenuLabel && (
                        <p className="text-sm text-lt-olive-dark">
                          {order.weeklyMenuLabel}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-lt-cream-dark pt-4">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-lt-charcoal/70">
                            {item.quantity}x {item.mealName}
                          </span>
                          <span className="font-medium text-lt-charcoal">
                            {formatCRC(Number(item.unitPrice) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-lt-cream-dark pt-3">
                      <span className="text-sm font-semibold">Total</span>
                      <span className="font-bold text-lt-terracotta">
                        {formatCRC(total)}
                      </span>
                    </div>
                  </div>
                </Link>
                {/* Cancel button — outside Link to prevent navigation clashes */}
                <div className="px-6 pb-5">
                  <CancelOrderButton orderId={order.id} orderStatus={order.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
