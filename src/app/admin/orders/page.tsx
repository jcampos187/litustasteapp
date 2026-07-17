import { db } from "@/db";
import { orders, orderItems, users, weeklyMenus } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { formatCRC, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default async function AdminOrdersPage(props: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status;

  const allOrders = await db
    .select({
      id: orders.id,
      customerId: orders.customerId,
      status: orders.status,
      notes: orders.notes,
      createdAt: orders.createdAt,
      customerName: users.name,
      customerEmail: users.email,
      weeklyMenuLabel: weeklyMenus.label,
    })
    .from(orders)
    .leftJoin(users, eq(orders.customerId, users.id))
    .leftJoin(weeklyMenus, eq(orders.weeklyMenuId, weeklyMenus.id))
    .orderBy(desc(orders.createdAt));

  const filteredOrders = statusFilter
    ? allOrders.filter((o) => o.status === statusFilter)
    : allOrders;

  // Fetch all order items in one batch
  const orderIds = filteredOrders.map((o) => o.id);
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

  // Counts for filter tabs
  const counts = {
    all: allOrders.length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    recibido: allOrders.filter((o) => o.status === "recibido").length,
    completed: allOrders.filter((o) => o.status === "completed").length,
  };

  const tabs = [
    { label: "Todos", value: undefined as string | undefined, count: counts.all },
    { label: "Pendientes", value: "pending", count: counts.pending },
    { label: "Recibidos", value: "recibido", count: counts.recibido },
    { label: "Completados", value: "completed", count: counts.completed },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Pedidos
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Gestiona los pedidos entrantes
      </p>

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value || "all"}
            href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
              statusFilter === tab.value || (!statusFilter && !tab.value)
                ? "border-lt-terracotta bg-lt-terracotta text-white"
                : "border-lt-cream-dark text-lt-charcoal/60 hover:border-lt-charcoal/30"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-70">({tab.count})</span>
          </Link>
        ))}
      </div>

      {/* Orders list */}
      <div className="mt-6">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-lt-cream-dark" />
            <p className="mt-3 text-lg font-medium text-lt-charcoal/60">
              No hay pedidos {statusFilter ? "en este estado" : "aún"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const items = itemsByOrderId[order.id] || [];

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-2xl border border-lt-cream-dark bg-white p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lt-warm-brown">
                          Pedido #{order.id.slice(0, 8)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-lt-charcoal/50">
                        {order.customerName || order.customerEmail || "Cliente"} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString("es-CR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {order.weeklyMenuLabel && (
                        <p className="text-sm text-lt-olive-dark">
                          {order.weeklyMenuLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-lt-charcoal/60">
                    {items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="rounded-lg bg-lt-cream px-2.5 py-1"
                      >
                        {item.quantity}x {item.mealName}
                      </span>
                    ))}
                    {items.length > 3 && (
                      <span className="text-lt-charcoal/40">
                        +{items.length - 3} más
                      </span>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="mt-3 text-right">
                      <span className="text-sm font-bold text-lt-terracotta">
                        {formatCRC(
                          items.reduce(
                            (sum, i) => sum + Number(i.unitPrice) * i.quantity,
                            0
                          )
                        )}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
