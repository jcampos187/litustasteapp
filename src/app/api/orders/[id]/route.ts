import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendOrderReceivedEmail, sendOrderCompletedEmail } from "@/lib/email";

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

    // Get customer info for email notifications
    const [orderWithCustomer] = await db
      .select({
        customerEmail: users.email,
        customerName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .where(eq(orders.id, id))
      .limit(1);

    const customerName = orderWithCustomer?.customerName || "Cliente";
    // TEMP: Send to admin email (litustasteapp@gmail.com) since Resend free tier
    // only allows sending to the verified email. Update once a domain is verified.
    const adminEmail = process.env.ADMIN_EMAIL || "kayfas12@gmail.com";

    try {
      if (status === "recibido") {
        await sendOrderReceivedEmail(adminEmail, customerName, id);
        console.log(`✅ Recibido email sent to admin (${adminEmail}) for order ${id}`);
      } else if (status === "completed") {
        await sendOrderCompletedEmail(adminEmail, customerName, id);
        console.log(`✅ Completed email sent to admin (${adminEmail}) for order ${id}`);
      }
    } catch (e) {
      console.error("Failed to send notification email:", e);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar el pedido" },
      { status: 500 }
    );
  }
}
