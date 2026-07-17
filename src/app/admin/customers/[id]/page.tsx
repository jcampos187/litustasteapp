import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, orders, orderItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatCRC, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default async function CustomerDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const [customer] = await db
    .select()
    .from(users)
    .where(eq(users.id, params.id))
    .limit(1);

  if (!customer) notFound();

  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customer.id))
    .orderBy(desc(orders.createdAt));

  // Get order items and totals for each order
  const ordersWithDetails = await Promise.all(
    customerOrders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      const total = items.reduce(
        (sum, i) => sum + Number(i.unitPrice) * i.quantity,
        0
      );

      return { ...order, items, total };
    })
  );

  const totalSpent = ordersWithDetails.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <Link
        href="/admin/customers"
        className="mb-6 inline-flex items-center gap-1 text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      {/* Customer Info */}
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lt-terracotta/10 to-lt-gold/10">
          <span className="text-3xl font-bold text-lt-terracotta">
            {customer.name?.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
            {customer.name || "Sin nombre"}
          </h1>
          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-2 text-sm text-lt-charcoal/60">
              <Mail className="h-4 w-4" />
              {customer.email}
            </p>
            {customer.phone && (
              <p className="flex items-center gap-2 text-sm text-lt-charcoal/60">
                <Phone className="h-4 w-4" />
                {customer.phone}
              </p>
            )}
          </div>

          {customer.deliveryAddress && (
            <div className="mt-3">
              <p className="flex items-start gap-2 text-sm text-lt-charcoal/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {customer.deliveryAddress}
                  {customer.city && <>, {customer.city}</>}
                  {customer.province && <>, {customer.province}</>}
                </span>
              </p>
            </div>
          )}

          {customer.dietaryNotes && (
            <p className="mt-2 text-sm text-lt-charcoal/50">
              🥗 {customer.dietaryNotes}
            </p>
          )}

          <div className="mt-4 flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold text-lt-terracotta">
                {ordersWithDetails.length}
              </p>
              <p className="text-xs text-lt-charcoal/50">
                Pedido{ordersWithDetails.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-lt-olive-dark">
                {formatCRC(totalSpent)}
              </p>
              <p className="text-xs text-lt-charcoal/50">Total gastado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-lt-warm-brown">
          Historial de Pedidos
        </h2>

        <div className="mt-4 space-y-4">
          {ordersWithDetails.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-lt-charcoal/60">
                Este cliente no ha realizado pedidos aún
              </p>
            </div>
          ) : (
            ordersWithDetails.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-2xl border border-lt-cream-dark bg-white p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lt-warm-brown">
                        Pedido #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-lt-charcoal/50">
                      {new Date(order.createdAt).toLocaleDateString("es-CR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-lt-terracotta">
                    {formatCRC(order.total)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-sm text-lt-charcoal/60">
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="rounded-lg bg-lt-cream px-2.5 py-1"
                    >
                      {item.quantity}x {item.mealName}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-lt-charcoal/40">
                      +{order.items.length - 3} más
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
