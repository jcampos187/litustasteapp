import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "../db/schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });
const { dietaryTags, businessSettings } = schema;

const defaultTags = [
  { name: "Vegano", slug: "vegan", emoji: "🌱", description: "Sin ingredientes de origen animal" },
  { name: "Vegetariano", slug: "vegetarian", emoji: "🥦", description: "Sin carne, puede incluir lácteos y huevos" },
  { name: "Sin Gluten", slug: "gluten-free", emoji: "🌾", description: "Libre de gluten" },
  { name: "Keto", slug: "keto", emoji: "🥑", description: "Bajo en carbohidratos, alto en grasas saludables" },
  { name: "Alta Proteína", slug: "high-protein", emoji: "💪", description: "Alto contenido de proteína" },
  { name: "Bajos Carbohidratos", slug: "low-carb", emoji: "🥗", description: "Bajo en carbohidratos" },
  { name: "Sin Lácteos", slug: "dairy-free", emoji: "🧀", description: "Libre de lácteos" },
  { name: "Sin Azúcar", slug: "sugar-free", emoji: "🍬", description: "Sin azúcar añadida" },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Seed dietary tags
  console.log("📋 Seeding dietary tags...");
  for (const tag of defaultTags) {
    const [existing] = await db
      .select()
      .from(dietaryTags)
      .where(sql`${dietaryTags.slug} = ${tag.slug}`)
      .limit(1);

    if (!existing) {
      await db.insert(dietaryTags).values(tag);
      console.log(`  ✅ ${tag.emoji} ${tag.name}`);
    } else {
      console.log(`  ⏭️  ${tag.name} (already exists)`);
    }
  }

  // Seed business settings
  const [existingSettings] = await db
    .select()
    .from(businessSettings)
    .limit(1);

  if (!existingSettings) {
    console.log("\n🏪 Seeding business settings...");
    await db.insert(businessSettings).values({
      businessName: "Litus Taste",
      slug: "litus-taste",
      description: "Comida preparada fresca y deliciosa. Hecho con ingredientes naturales y mucho amor en Costa Rica.",
      contactEmail: "info@litustaste.com",
    });
    console.log("  ✅ Business settings created");
  } else {
    console.log("\n⏭️  Business settings already exist");
  }

  console.log("\n✨ Seed complete!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));
