import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, pushSubscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Subscribe a customer to push notifications.
 */
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

  try {
    const body = await request.json();
    const { endpoint, p256dh, auth: authKey } = body;

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json(
        { error: "Faltan datos de suscripción" },
        { status: 400 }
      );
    }

    // Check if already subscribed with this endpoint
    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, dbUser.id),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({ p256dh, auth: authKey, updatedAt: new Date() })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      // Create new subscription
      await db.insert(pushSubscriptions).values({
        userId: dbUser.id,
        endpoint,
        p256dh,
        auth: authKey,
        userAgent: request.headers.get("user-agent") || null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Error al guardar suscripción" },
      { status: 500 }
    );
  }
}

/**
 * Unsubscribe a customer from push notifications.
 */
export async function DELETE(request: Request) {
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

  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "Falta endpoint" },
        { status: 400 }
      );
    }

    await db
      .delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, dbUser.id),
          eq(pushSubscriptions.endpoint, endpoint)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return NextResponse.json(
      { error: "Error al eliminar suscripción" },
      { status: 500 }
    );
  }
}
