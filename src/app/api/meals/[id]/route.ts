import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { meals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateMealSchema } from "@/lib/validations";
import { z } from "zod";

export async function DELETE(
  _request: Request,
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
    await db.delete(meals).where(eq(meals.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar el platillo" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const parsed = updateMealSchema.parse(body);

    const [updated] = await db
      .update(meals)
      .set({
        name: parsed.name,
        description: parsed.description,
        price: parsed.price.toString(),
        portionSize: parsed.portionSize ?? null,
        calories: parsed.calories ?? null,
        proteinG: parsed.proteinG ?? null,
        carbsG: parsed.carbsG ?? null,
        fatG: parsed.fatG ?? null,
        dietaryTags: parsed.dietaryTags?.length
          ? parsed.dietaryTags.join(",")
          : null,
        isActive: parsed.isActive,
        updatedAt: new Date(),
      })
      .where(eq(meals.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar el platillo" },
      { status: 500 }
    );
  }
}
