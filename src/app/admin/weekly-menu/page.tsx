import { db } from "@/db";
import { meals, weeklyMenus, weeklyMenuItems, dietaryTags } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import WeeklyMenuManager from "./WeeklyMenuManager";

export default async function AdminWeeklyMenuPage() {
  const allMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.isActive, true))
    .orderBy(meals.sortOrder);

  const activeMenu = await db
    .select()
    .from(weeklyMenus)
    .where(
      and(
        eq(weeklyMenus.isArchived, false),
        eq(weeklyMenus.isPublished, true)
      )
    )
    .orderBy(desc(weeklyMenus.createdAt))
    .limit(1);

  const draftMenu = await db
    .select()
    .from(weeklyMenus)
    .where(
      and(
        eq(weeklyMenus.isArchived, false),
        eq(weeklyMenus.isPublished, false)
      )
    )
    .orderBy(desc(weeklyMenus.createdAt))
    .limit(1);

  let currentMenu = activeMenu[0] || draftMenu[0] || null;
  let menuItems: string[] = [];

  if (currentMenu) {
    const items = await db
      .select({ mealId: weeklyMenuItems.mealId })
      .from(weeklyMenuItems)
      .where(eq(weeklyMenuItems.weeklyMenuId, currentMenu.id));

    menuItems = items.map((i) => i.mealId);
  }

  const tags = await db.select().from(dietaryTags);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Menú Semanal
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Gestiona el menú de la semana
      </p>

      <div className="mt-8">
        <WeeklyMenuManager
          allMeals={allMeals}
          currentMenu={currentMenu}
          menuItems={menuItems}
          tags={tags}
        />
      </div>
    </div>
  );
}
