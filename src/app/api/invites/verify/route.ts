import { NextResponse } from "next/server";
import { db } from "@/db";
import { customerInvites } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valid: false, error: "Token requerido" },
      { status: 400 }
    );
  }

  const [invite] = await db
    .select()
    .from(customerInvites)
    .where(eq(customerInvites.inviteToken, token))
    .limit(1);

  if (!invite) {
    return NextResponse.json(
      { valid: false, error: "Invitación no válida" },
      { status: 404 }
    );
  }

  if (invite.usedAt) {
    return NextResponse.json(
      { valid: false, error: "Esta invitación ya fue utilizada" },
      { status: 410 }
    );
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json(
      { valid: false, error: "Esta invitación ha expirado" },
      { status: 410 }
    );
  }

  return NextResponse.json({ valid: true, email: invite.email });
}
