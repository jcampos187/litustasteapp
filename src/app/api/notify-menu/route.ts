import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { weeklyMenus, users, pushSubscriptions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendMenuNotification } from "@/lib/email";
import { sendPushNotificationToAll } from "@/lib/push";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser || dbUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    // Get active published menu
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

    if (!activeMenu) {
      return NextResponse.json(
        { error: "No hay un menú activo publicado" },
        { status: 400 }
      );
    }

    // ── Email notifications ────────────────────────────────────
    const customers = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.role, "customer"));

    const customerEmails = customers
      .map((c) => c.email)
      .filter(Boolean) as string[];

    if (customerEmails.length > 0) {
      await sendMenuNotification(
        customerEmails,
        activeMenu.label,
        activeMenu.orderCutoff
      );
    }

    // ── Push notifications ─────────────────────────────────────
    const allSubs = await db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        p256dh: pushSubscriptions.p256dh,
        auth: pushSubscriptions.auth,
      })
      .from(pushSubscriptions);

    let pushNotified = 0;
    let pushExpired = 0;

    if (allSubs.length > 0) {
      const expiredIds = await sendPushNotificationToAll(allSubs, {
        title: `🍽️ Nuevo Menú: ${activeMenu.label}`,
        body: "El menú de esta semana ya está disponible. Haz tu pedido ahora.",
        url: "/menu",
      });

      pushNotified = allSubs.length - expiredIds.length;
      pushExpired = expiredIds.length;

      // Clean up expired subscriptions
      if (expiredIds.length > 0) {
        for (const id of expiredIds) {
          await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, id));
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailNotified: customerEmails.length,
      pushNotified,
      pushExpired,
    });
  } catch (error) {
    console.error("Error sending menu notifications:", error);
    return NextResponse.json(
      { error: "Error al enviar notificaciones" },
      { status: 500 }
    );
  }
}
