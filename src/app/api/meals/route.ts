import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { meals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createMealSchema } from "@/lib/validations";
import { z } from "zod";

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
    const parsed = createMealSchema.parse(body);

    const [meal] = await db
      .insert(meals)
      .values({
        name: parsed.name,
        description: parsed.description || "",
        price: parsed.price.toString(),
        portionSize: parsed.portionSize ?? null,
        calories: parsed.calories ?? null,
        proteinG: parsed.proteinG ?? null,
        carbsG: parsed.carbsG ?? null,
        fatG: parsed.fatG ?? null,
        dietaryTags: parsed.dietaryTags?.length
          ? parsed.dietaryTags.join(",")
          : null,
      })
      .returning();

    return NextResponse.json(meal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Error al crear el platillo" },
      { status: 500 }
    );
  }
}
