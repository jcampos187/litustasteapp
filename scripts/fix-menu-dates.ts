/**
 * Migration: Fix existing weekly menu dates by adding 6 hours
 *
 * The old code used `new Date("2026-07-20")` which parsed as UTC midnight,
 * shifting dates back 6h in Costa Rica (UTC-6). For example, July 20 (Mon)
 * was stored as 2026-07-20T00:00:00.000Z, which displays as July 19.
 *
 * The fix: add 6 hours to existing weekStart and weekEnd so they represent
 * local midnight in CR timezone (2026-07-20T06:00:00.000Z = July 20 at 00:00 CR).
 */
import { db } from "@/db";
import { weeklyMenus } from "@/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🔍 Checking for menus with UTC-midnight dates...");

  const menus = await db
    .select({
      id: weeklyMenus.id,
      label: weeklyMenus.label,
      weekStart: weeklyMenus.weekStart,
      weekEnd: weeklyMenus.weekEnd,
    })
    .from(weeklyMenus)
    .orderBy(weeklyMenus.createdAt);

  console.log(`Found ${menus.length} weekly menu(s).`);

  let fixedCount = 0;

  for (const menu of menus) {
    const ws = menu.weekStart;
    const we = menu.weekEnd;

    // Check if the dates are at UTC midnight (00:00:00.000Z)
    // which means they're off by 6h from CR local time
    const wsHours = ws.getUTCHours();
    const wsMinutes = ws.getUTCMinutes();
    const weHours = we.getUTCHours();
    const weMinutes = we.getUTCMinutes();

    if (wsHours === 0 && wsMinutes === 0) {
      // Add 6 hours to shift from UTC midnight to CR midnight
      const fixedWs = new Date(ws.getTime() + 6 * 60 * 60 * 1000);
      const fixedWe = new Date(we.getTime() + 6 * 60 * 60 * 1000);

      await db
        .update(weeklyMenus)
        .set({
          weekStart: fixedWs,
          weekEnd: fixedWe,
        })
        .where(sql`id = ${menu.id}`);

      console.log(
        `  ✅ Menu "${menu.label}": ${ws.toISOString()} → ${fixedWs.toISOString()}`
      );
      fixedCount++;
    } else {
      console.log(
        `  ⏭️  Menu "${menu.label}" already has local-time dates (${ws.toISOString()})`
      );
    }
  }

  console.log(`\nDone! ${fixedCount} menu(s) fixed.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
