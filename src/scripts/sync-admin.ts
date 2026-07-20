/* eslint-disable no-console */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const clerkId = process.argv[2];
  const email = process.argv[3];
  const name = process.argv[4] || email.split("@")[0];

  if (!clerkId || !email) {
    console.error("Usage: npx tsx src/scripts/sync-admin.ts <clerkId> <email> [name]");
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema });
  const { users } = schema;

  // Check if exists
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (existing.length > 0) {
    console.log("User already exists, updating to admin...");
    await db.update(users)
      .set({ role: "admin", email, name: name, updatedAt: new Date() })
      .where(eq(users.clerkId, clerkId));
    console.log("✅ Updated to admin");
  } else {
    console.log("Creating new admin user...");
    await db.insert(users).values({
      clerkId,
      email,
      name,
      role: "admin",
    });
    console.log("✅ Admin user created");
  }

  // Verify
  const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  console.log(`User: ${user.name} (${user.email}) - Role: ${user.role}`);
}

main().catch(console.error);
