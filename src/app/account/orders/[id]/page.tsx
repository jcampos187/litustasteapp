import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, users, weeklyMenus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCRC, getOrderStatusLabel, getOrderStatusColor } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CancelOrderButton from "@/components/CancelOrderButton";

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  const params = await props.params;
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser) redirect("/auth/sign-in");

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

  if (!order || order.customerId !== dbUser.id) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const total = items.reduce(
    (sum, i) => sum + Number(i.unitPrice) * i.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/account/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis Pedidos
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
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${getOrderStatusColor(order.status)}`}
        >
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      {order.weeklyMenuLabel && (
        <p className="mt-4 text-sm text-lt-olive-dark">
          Menú: {order.weeklyMenuLabel}
        </p>
      )}

      {/* Items */}
      <div className="mt-8 rounded-2xl border border-lt-cream-dark bg-white">
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

      {/* Cancel order (only when pending) */}
      <div className="mt-6 flex justify-end">
        <CancelOrderButton orderId={order.id} orderStatus={order.status} />
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-6 rounded-2xl border border-lt-cream-dark bg-white p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-lt-charcoal/50">
            Notas
          </h3>
          <p className="mt-2 text-sm text-lt-charcoal/70">{order.notes}</p>
        </div>
      )}

      {/* Status timeline */}
      <div className="mt-6 rounded-2xl border border-lt-cream-dark bg-white p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-lt-charcoal/50">
          Estado del Pedido
        </h3>
        <div className="mt-4 space-y-4">
          {[
            { status: "pending", label: "Pendiente" },
            { status: "recibido", label: "Recibido" },
            { status: "completed", label: "Completado" },
          ].map((step, i) => {
            const statusOrder = ["pending", "recibido", "completed"];
            const currentIndex = statusOrder.indexOf(order.status);
            const isActive = statusOrder.indexOf(step.status) <= currentIndex || order.status === "cancelled";
            return (
              <div key={step.status} className="flex items-center gap-4">
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
                    isActive ? "font-medium text-lt-charcoal" : "text-lt-charcoal/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


