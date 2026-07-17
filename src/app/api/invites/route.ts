import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { customerInvites, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "@/lib/utils";
import { sendInviteEmail } from "@/lib/email";

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

  if (!dbUser || dbUser.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Correo electrónico requerido" },
        { status: 400 }
      );
    }

    // Check if already invited or registered
    const [existingInvite] = await db
      .select()
      .from(customerInvites)
      .where(eq(customerInvites.email, email))
      .limit(1);

    if (existingInvite && !existingInvite.usedAt) {
      // Re-send invitation
      await sendInviteEmail(email, existingInvite.inviteToken);
      return NextResponse.json({ message: "Invitación reenviada" });
    }

    if (existingInvite?.usedAt) {
      return NextResponse.json(
        { error: "Este correo ya tiene una cuenta activa" },
        { status: 409 }
      );
    }

    // Create new invite
    const inviteToken = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invite] = await db
      .insert(customerInvites)
      .values({
        email,
        inviteToken,
        expiresAt,
        createdBy: dbUser.id,
      })
      .returning();

    // Send email
    await sendInviteEmail(email, inviteToken);

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Error al crear invitación" },
      { status: 500 }
    );
  }
}
