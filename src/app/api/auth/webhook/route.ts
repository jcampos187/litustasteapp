import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Clerk webhook handler for user.created and user.updated events.
 * Syncs Clerk user data to the local PostgreSQL database.
 *
 * Note: In production, verify webhook signatures using the Svix library.
 * For now, this trusts the request origin (which is fine for prototyping).
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { type, data } = payload;

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || "";
      const name =
        data.first_name && data.last_name
          ? `${data.first_name} ${data.last_name}`
          : data.first_name || email.split("@")[0];
      const avatarUrl = data.image_url || null;

      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (existingUser) {
        // Update existing user
        await db
          .update(users)
          .set({
            email,
            name,
            avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, clerkId));
      } else {
        // Create new user (default role is customer)
        await db.insert(users).values({
          clerkId,
          email,
          name,
          avatarUrl,
          role: "customer",
        });
      }
    }

    if (type === "user.deleted") {
      const clerkId = data.id;
      await db.delete(users).where(eq(users.clerkId, clerkId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
