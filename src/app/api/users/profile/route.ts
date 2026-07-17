import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
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

  return NextResponse.json(dbUser);
}

export async function PATCH(request: Request) {
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
    const { name, phone, deliveryAddress, city, province, postalCode, dietaryNotes } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (dietaryNotes !== undefined) updateData.dietaryNotes = dietaryNotes;

    // If name + phone + delivery address are filled, mark profile as complete
    const finalName = name ?? dbUser.name;
    const finalPhone = phone ?? dbUser.phone;
    const finalAddress = deliveryAddress ?? dbUser.deliveryAddress;
    if (finalName && finalPhone && finalAddress) {
      updateData.profileComplete = true;
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, dbUser.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Error al actualizar el perfil" },
      { status: 500 }
    );
  }
}
