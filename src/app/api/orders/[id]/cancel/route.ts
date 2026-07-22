import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendOrderCancelledEmail } from "@/lib/email";
import { sendOrderCancelledWhatsApp } from "@/lib/whatsapp";

/**
 * Customer cancels their own order — only allowed when status is "pending".
 * Sends notifications to both the admin and the customer.
 */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const { id } = await params;

  // Get the order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  // Verify this is the customer's own order
  if (order.customerId !== dbUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // Only allow cancellation if status is "pending"
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Solo puedes cancelar pedidos que estén pendientes" },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    // ── Send cancellation notifications ─────────────────────────
    // Fetch order items for the notification
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    const itemsForNotification = items.map((i) => ({
      mealName: i.mealName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    const fullName = `${dbUser.name || ""} ${dbUser.lastName || ""}`.trim() || dbUser.email;

    // Email: both admin + customer
    sendOrderCancelledEmail(
      dbUser.email,
      fullName,
      id,
      itemsForNotification
    ).catch(console.error);

    // WhatsApp: admin
    sendOrderCancelledWhatsApp(
      fullName,
      itemsForNotification,
      dbUser.phone
    ).catch(console.error);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al cancelar el pedido" },
      { status: 500 }
    );
  }
}
