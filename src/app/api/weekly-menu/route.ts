import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { weeklyMenus, weeklyMenuItems, users } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    const { mealIds, publish, label, weekStart, weekEnd, orderCutoff, publishAt } = body;

    if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
      return NextResponse.json(
        { error: "Selecciona al menos un platillo" },
        { status: 400 }
      );
    }

    // Create new weekly menu
    const [menu] = await db
      .insert(weeklyMenus)
      .values({
        label: label || `Menú Semanal`,
        weekStart: weekStart ? new Date(weekStart + "T00:00:00") : new Date(),
        weekEnd: weekEnd
          ? new Date(weekEnd + "T00:00:00")
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        orderCutoff: orderCutoff ? new Date(orderCutoff) : null,
        publishAt: publishAt ? new Date(publishAt) : null,
        isPublished: publish || false,
        publishedAt: publish ? new Date() : null,
      })
      .returning();

    // Insert menu items
    const items = mealIds.map((mealId: string, index: number) => ({
      weeklyMenuId: menu.id,
      mealId,
      displayOrder: index,
    }));

    await db.insert(weeklyMenuItems).values(items);

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error creating weekly menu:", error);
    return NextResponse.json(
      { error: "Error al crear el menú semanal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const { menuId, mealIds, publish, label, weekStart, weekEnd, orderCutoff, publishAt } = body;

    if (!menuId) {
      return NextResponse.json({ error: "ID del menú requerido" }, { status: 400 });
    }

    // Update menu
    await db
      .update(weeklyMenus)
      .set({
        label,
        weekStart: weekStart ? new Date(weekStart + "T00:00:00") : undefined,
        weekEnd: weekEnd ? new Date(weekEnd + "T00:00:00") : undefined,
        orderCutoff: orderCutoff ? new Date(orderCutoff) : null,
        publishAt: publishAt ? new Date(publishAt) : null,
        isPublished: publish || undefined,
        publishedAt: publish ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(weeklyMenus.id, menuId));

    // Replace menu items
    await db
      .delete(weeklyMenuItems)
      .where(eq(weeklyMenuItems.weeklyMenuId, menuId));

    const items = mealIds.map((mealId: string, index: number) => ({
      weeklyMenuId: menuId,
      mealId,
      displayOrder: index,
    }));

    await db.insert(weeklyMenuItems).values(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating weekly menu:", error);
    return NextResponse.json(
      { error: "Error al actualizar el menú semanal" },
      { status: 500 }
    );
  }
}
