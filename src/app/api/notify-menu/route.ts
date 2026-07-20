import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { weeklyMenus, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendMenuNotification } from "@/lib/email";

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

    // Get all registered customers
    const customers = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.role, "customer"));

    const customerEmails = customers
      .map((c) => c.email)
      .filter(Boolean) as string[];

    if (customerEmails.length === 0) {
      return NextResponse.json(
        { error: "No hay clientes registrados para notificar" },
        { status: 400 }
      );
    }

    await sendMenuNotification(
      customerEmails,
      activeMenu.label,
      activeMenu.orderCutoff
    );

    return NextResponse.json({
      success: true,
      notified: customerEmails.length,
    });
  } catch (error) {
    console.error("Error sending menu notifications:", error);
    return NextResponse.json(
      { error: "Error al enviar notificaciones" },
      { status: 500 }
    );
  }
}
