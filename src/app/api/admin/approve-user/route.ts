import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notifyUserApprovalStatus } from "@/lib/email";

export async function POST(request: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, action, clerkId } = body;

    if (!userId || !action || !clerkId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Get the user's info before modifying
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (action === "approve") {
      // Approve user - set isActive to true
      await db
        .update(users)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(users.id, userId));

      // Notify the user they've been approved
      await notifyUserApprovalStatus(targetUser.email, targetUser.name || targetUser.email, "approved").catch(console.error);

      return NextResponse.json({ success: true, message: "Usuario aprobado" });
    } else if (action === "decline") {
      // Notify the user they've been declined (before deleting)
      await notifyUserApprovalStatus(targetUser.email, targetUser.name || targetUser.email, "declined").catch(console.error);

      // Decline user - delete from DB and from Clerk
      await db.delete(users).where(eq(users.id, userId));

      // Also remove from Clerk
      try {
        await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        });
      } catch {
        // Ignore Clerk delete errors
      }

      return NextResponse.json({ success: true, message: "Usuario rechazado" });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
