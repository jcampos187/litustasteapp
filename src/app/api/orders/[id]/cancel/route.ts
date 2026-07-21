import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Customer cancels their own order — only allowed when status is "pending".
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

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al cancelar el pedido" },
      { status: 500 }
    );
  }
}
