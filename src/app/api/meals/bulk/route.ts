import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { meals, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const bulkMealItemSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional().default(""),
  price: z.number().positive("El precio debe ser positivo"),
  portionSize: z.string().optional().nullable(),
  calories: z.number().int().positive().optional().nullable(),
  proteinG: z.number().int().positive().optional().nullable(),
  carbsG: z.number().int().positive().optional().nullable(),
  fatG: z.number().int().positive().optional().nullable(),
  dietaryTags: z.array(z.string()).optional(),
});

const bulkMealSchema = z.array(bulkMealItemSchema).min(1, "Debes incluir al menos un platillo").max(100, "Máximo 100 platillos por lote");

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
    const parsed = bulkMealSchema.parse(body);

    const created = await db
      .insert(meals)
      .values(
        parsed.map((item) => ({
          name: item.name,
          description: item.description || "",
          price: item.price.toString(),
          portionSize: item.portionSize ?? null,
          calories: item.calories ?? null,
          proteinG: item.proteinG ?? null,
          carbsG: item.carbsG ?? null,
          fatG: item.fatG ?? null,
          dietaryTags: item.dietaryTags?.length
            ? item.dietaryTags.join(",")
            : null,
        }))
      )
      .returning({ id: meals.id, name: meals.name });

    return NextResponse.json({
      message: `${created.length} platillos creados exitosamente`,
      meals: created,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error en importación masiva:", error);
    return NextResponse.json(
      { error: "Error al importar platillos" },
      { status: 500 }
    );
  }
}
