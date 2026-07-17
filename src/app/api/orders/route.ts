import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users, weeklyMenus } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendOrderNotification } from "@/lib/email";
import { sendOrderWhatsApp } from "@/lib/whatsapp";

export async function POST(request: Request) {
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

  // Check if user is approved
  if (!dbUser.isActive) {
    return NextResponse.json(
      { error: "Tu cuenta está pendiente de aprobación. Espera a que el administrador la active." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "El pedido debe tener al menos un artículo" },
        { status: 400 }
      );
    }

    // Find the current active weekly menu
    const [activeMenu] = await db
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

    // Create the order
    const [order] = await db
      .insert(orders)
      .values({
        customerId: dbUser.id,
        weeklyMenuId: activeMenu?.id || null,
        notes: notes || null,
      })
      .returning();

    // Insert order items
    const orderItemsData = items.map(
      (item: { mealId: string; mealName: string; quantity: number; unitPrice: number }) => ({
        orderId: order.id,
        mealId: item.mealId || null,
        mealName: item.mealName,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice.toString(),
      })
    );

    await db.insert(orderItems).values(orderItemsData);

    // Send notifications to admin
    const orderItemsForNotification = orderItemsData.map((i: { mealName: string; quantity: number; unitPrice: string }) => ({
      mealName: i.mealName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    // Email notification
    sendOrderNotification(dbUser.name || dbUser.email, dbUser.email, orderItemsForNotification, notes || null).catch(console.error);

    // WhatsApp notification
    sendOrderWhatsApp(dbUser.name || dbUser.email, orderItemsForNotification, dbUser.phone, notes || null).catch(console.error);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error al crear el pedido" },
      { status: 500 }
    );
  }
}
