import { db } from "@/db";
import { meals, dietaryTags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import EditMealForm from "./EditMealForm";

export default async function EditMealPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [meal] = await db.select().from(meals).where(eq(meals.id, params.id)).limit(1);
  if (!meal) notFound();

  const tags = await db.select().from(dietaryTags);

  return <EditMealForm meal={meal} allTags={tags} />;
}
