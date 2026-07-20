import { db } from "@/db";
import { users, orders, orderItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Plus, Users, Mail } from "lucide-react";
import { formatCRC } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const allCustomers = await db
    .select()
    .from(users)
    .where(eq(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  // Get order counts and totals for each customer
  const customerStats = await Promise.all(
    allCustomers.map(async (customer) => {
      const customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.customerId, customer.id));

      let totalSpent = 0;
      for (const order of customerOrders) {
        const orderItemsList = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        totalSpent += orderItemsList.reduce(
          (sum, i) => sum + Number(i.unitPrice) * i.quantity,
          0
        );
      }

      return {
        ...customer,
        orderCount: customerOrders.length,
        totalSpent,
        lastOrder: customerOrders.length > 0
          ? new Date(Math.max(...customerOrders.map((o) => o.createdAt.getTime())))
          : null,
      };
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-lt-charcoal/60">
            {allCustomers.length} cliente{allCustomers.length !== 1 ? "s" : ""} registrado
            {allCustomers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/customers/invite"
          className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark"
        >
          <Plus className="h-4 w-4" />
          Invitar Cliente
        </Link>
      </div>

      {allCustomers.length === 0 ? (
        <div className="mt-16 text-center">
          <Users className="mx-auto h-16 w-16 text-lt-cream-dark" />
          <p className="mt-4 text-lg font-medium text-lt-charcoal/60">
            No hay clientes registrados aún
          </p>
          <Link
            href="/admin/customers/invite"
            className="lt-btn mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Invitar Primer Cliente
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <div className="space-y-3">
            {customerStats.map((customer) => (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="flex items-center gap-4 rounded-2xl border border-lt-cream-dark bg-white p-5 transition-all hover:shadow-md"
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lt-terracotta/10 to-lt-gold/10">
                  {customer.name ? (
                    <span className="text-lg font-bold text-lt-terracotta">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <Users className="h-5 w-5 text-lt-charcoal/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lt-warm-brown truncate">
                    {customer.name || "Sin nombre"}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-lt-charcoal/50">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {customer.email}
                    </span>
                  </div>
                  {customer.lastOrder && (
                    <p className="text-xs text-lt-charcoal/40 mt-0.5">
                      Último pedido:{" "}
                      {customer.lastOrder.toLocaleDateString("es-CR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="font-bold text-lt-terracotta">
                    {formatCRC(customer.totalSpent)}
                  </p>
                  <p className="text-xs text-lt-charcoal/50">
                    {customer.orderCount} pedido{customer.orderCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
