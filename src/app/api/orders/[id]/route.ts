import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users, pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendOrderReceivedEmail, sendOrderCompletedEmail } from "@/lib/email";
import { sendOrderStatusChangedWhatsApp } from "@/lib/whatsapp";
import { sendPushNotificationToAll } from "@/lib/push";

/**
 * When sending emails to customers (order received, completed) the system
 * sends directly to the customer's email address.
 *
 * ⚠️ Requires a verified domain in Resend (not just the onboarding@resend.dev
 * sender). Until a custom domain (e.g., litustaste.com) is verified, Resend's
 * free tier only delivers to the verified admin email. See:
 *   https://resend.com/domains
 *
 * When order status changes, the admin also receives a WhatsApp notification.
 */

export async function PATCH(
  request: Request,
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

  if (!dbUser || dbUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Estado requerido" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "recibido", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    // Get customer info for notifications
    const [orderWithCustomer] = await db
      .select({
        customerEmail: users.email,
        customerName: users.name,
        customerLastName: users.lastName,
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.id, id))
      .limit(1);

    const customerFullName = `${orderWithCustomer?.customerName || ""} ${orderWithCustomer?.customerLastName || ""}`.trim() || "Cliente";
    const customerEmail = orderWithCustomer?.customerEmail;

    // ── Send email notifications to the customer ────────────────
    // Until a custom domain is verified in Resend, emails will only deliver
    // to the admin's verified address (ADMIN_EMAIL).
    if (customerEmail) {
      try {
        if (status === "recibido") {
          await sendOrderReceivedEmail(customerEmail, customerFullName, id);
          console.warn(`✅ Recibido email sent to ${customerEmail} for order ${id}`);
        } else if (status === "completed") {
          await sendOrderCompletedEmail(customerEmail, customerFullName, id);
          console.warn(`✅ Completed email sent to ${customerEmail} for order ${id}`);
        }
      } catch (e) {
        console.error("Failed to send notification email:", e);
      }
    }

    // ── Send WhatsApp notification to the admin ─────────────────
    if (status === "recibido" || status === "completed") {
      sendOrderStatusChangedWhatsApp(customerFullName, id, status).catch(console.error);
    }

    // ── Send push notification to the customer ──────────────────
    if ((status === "recibido" || status === "completed") && customerEmail) {
      // Use the order's customerId directly to find push subscriptions
      sendPushNotificationToAll(
        await db
          .select({
            id: pushSubscriptions.id,
            endpoint: pushSubscriptions.endpoint,
            p256dh: pushSubscriptions.p256dh,
            auth: pushSubscriptions.auth,
          })
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, updated.customerId)),
        status === "recibido"
          ? {
              title: "✅ ¡Pedido Recibido!",
              body: `Hemos recibido tu pedido correctamente, ${customerFullName}.`,
              url: `/account/orders/${id}`,
            }
          : {
              title: "🍽️ ¡Pedido Completado!",
              body: `Tu pedido está listo, ${customerFullName}. ¡Buen provecho!`,
              url: `/account/orders/${id}`,
            }
      )
        .then((expiredIds) => {
          // Clean up expired subscriptions
          if (expiredIds.length > 0) {
            return Promise.all(
              expiredIds.map((expiredId) =>
                db
                  .delete(pushSubscriptions)
                  .where(eq(pushSubscriptions.id, expiredId))
              )
            );
          }
        })
        .catch(console.error);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}
