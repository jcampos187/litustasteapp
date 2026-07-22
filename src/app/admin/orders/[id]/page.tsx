import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, users, weeklyMenus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCRC, getOrderStatusLabel } from "@/lib/utils";
import OrderStatusManager from "./OrderStatusManager";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default async function AdminOrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const [order] = await db
    .select({
      id: orders.id,
      customerId: orders.customerId,
      status: orders.status,
      notes: orders.notes,
      createdAt: orders.createdAt,
      weeklyMenuLabel: weeklyMenus.label,
    })
    .from(orders)
    .leftJoin(weeklyMenus, eq(orders.weeklyMenuId, weeklyMenus.id))
    .where(eq(orders.id, params.id))
    .limit(1);

  if (!order) notFound();

  const [customer] = await db
    .select()
    .from(users)
    .where(eq(users.id, order.customerId))
    .limit(1);

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const total = items.reduce(
    (sum, i) => sum + Number(i.unitPrice) * i.quantity,
    0
  );

  const statuses = ["pending", "recibido", "completed", "cancelled"] as const;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pedidos
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-lt-charcoal/50">
            {new Date(order.createdAt).toLocaleDateString("es-CR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusManager orderId={order.id} currentStatus={order.status} statuses={statuses} />
        </div>
      </div>

      {order.weeklyMenuLabel && (
        <p className="mt-2 text-sm text-lt-olive-dark">
          Menú: {order.weeklyMenuLabel}
        </p>
      )}

      {/* Customer info */}
      <div className="mt-8 rounded-2xl border border-lt-cream-dark bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-lt-charcoal/50">
          Cliente
        </h2>
        <p className="mt-2 text-lg font-medium text-lt-warm-brown">
          {`${customer?.name || ""} ${customer?.lastName || ""}`.trim() || "Sin nombre"}
        </p>
        <div className="mt-3 space-y-2">
          {customer?.email && (
            <p className="flex items-center gap-2 text-sm text-lt-charcoal/60">
              <Mail className="h-4 w-4" />
              {customer.email}
            </p>
          )}
          {customer?.phone && (
            <p className="flex items-center gap-2 text-sm text-lt-charcoal/60">
              <Phone className="h-4 w-4" />
              {customer.phone}
            </p>
          )}
        </div>

        {customer?.deliveryAddress && (
          <>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">
              Dirección de Entrega
            </h3>
            <div className="mt-2 space-y-1">
              <p className="flex items-start gap-2 text-sm text-lt-charcoal/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lt-terracotta/70" />
                <span>
                  {customer.deliveryAddress}
                  {customer.city && <>, {customer.city}</>}
                  {customer.province && <>, {customer.province}</>}
                  {customer.postalCode && <> · {customer.postalCode}</>}
                </span>
              </p>
            </div>
          </>
        )}

        {customer?.dietaryNotes && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">
              Notas Dietéticas
            </h3>
            <p className="mt-1 text-sm text-lt-charcoal/70">{customer.dietaryNotes}</p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="mt-6 rounded-2xl border border-lt-cream-dark bg-white">
        <div className="border-b border-lt-cream-dark px-6 py-4">
          <h2 className="font-semibold text-lt-warm-brown">Artículos</h2>
        </div>
        <div className="divide-y divide-lt-cream-dark">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="font-medium text-lt-warm-brown">
                  {item.mealName}
                </p>
                <p className="text-sm text-lt-charcoal/50">
                  {item.quantity}x {formatCRC(item.unitPrice)}
                </p>
              </div>
              <span className="font-medium">
                {formatCRC(Number(item.unitPrice) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-lt-cream-dark px-6 py-4">
          <span className="font-semibold text-lt-warm-brown">Total</span>
          <span className="text-xl font-bold text-lt-terracotta">
            {formatCRC(total)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-6 rounded-2xl border border-lt-cream-dark bg-white p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-lt-charcoal/50">
            Notas del Cliente
          </h3>
          <p className="mt-2 text-sm text-lt-charcoal/70">{order.notes}</p>
        </div>
      )}

      {/* Status Timeline */}
      <div className="mt-6 rounded-2xl border border-lt-cream-dark bg-white p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-lt-charcoal/50">
          Estado del Pedido
        </h3>
        <div className="mt-4 space-y-4">
          {["pending", "recibido", "completed"].map((status, i) => {
            const statusOrder = ["pending", "recibido", "completed"];
            const currentIndex = statusOrder.indexOf(order.status);
            const isActive = statusOrder.indexOf(status) <= currentIndex;

            return (
              <div key={status} className="flex items-center gap-4">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-lt-terracotta text-white"
                      : "bg-lt-cream-dark text-lt-charcoal/30"
                  }`}
                >
                  {isActive ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm ${
                    isActive
                      ? "font-medium text-lt-charcoal"
                      : "text-lt-charcoal/40"
                  }`}
                >
                  {getOrderStatusLabel(status)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
