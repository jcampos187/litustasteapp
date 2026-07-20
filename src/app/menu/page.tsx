import { db } from "@/db";
import { meals, weeklyMenus, weeklyMenuItems, dietaryTags } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import MenuClient from "./MenuClient";

async function getMenuData() {
  try {
    const menu = await db
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

    if (menu.length === 0) return { menu: null, items: [], tags: [] };

    const items = await db
      .select({
        id: meals.id,
        name: meals.name,
        description: meals.description,
        price: meals.price,
        currency: meals.currency,
        portionSize: meals.portionSize,
        imageUrl: meals.imageUrl,
        calories: meals.calories,
        proteinG: meals.proteinG,
        carbsG: meals.carbsG,
        fatG: meals.fatG,
        dietaryTags: meals.dietaryTags,
        sortOrder: meals.sortOrder,
      })
      .from(weeklyMenuItems)
      .innerJoin(meals, eq(weeklyMenuItems.mealId, meals.id))
      .where(
        and(
          eq(weeklyMenuItems.weeklyMenuId, menu[0].id),
          eq(meals.isActive, true)
        )
      )
      .orderBy(weeklyMenuItems.displayOrder);

    const tags = await db.select().from(dietaryTags);

    return { menu: menu[0], items, tags };
  } catch {
    return { menu: null, items: [], tags: [] };
  }
}

export const metadata = {
  title: "Menú Semanal — Litus Taste",
  description: "Descubre el menú semanal de Litus Taste. Comida preparada fresca y saludable.",
};

export default async function MenuPage() {
  const { menu, items, tags } = await getMenuData();

  return <MenuClient menu={menu} items={items} tags={tags} />;
}
