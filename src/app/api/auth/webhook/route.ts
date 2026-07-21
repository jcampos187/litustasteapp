import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Clerk webhook handler for user.created, user.updated, and user.deleted events.
 * Syncs Clerk user data to the local PostgreSQL database.
 *
 * Webhook signatures are verified using the Svix library.
 *
 * To set up in Clerk Dashboard:
 *   1. Go to Clerk Dashboard → Webhooks
 *   2. Add endpoint: https://litustasteapp.vercel.app/api/auth/webhook
 *   3. Subscribe to: user.created, user.updated, user.deleted
 *   4. Copy the "Signing Secret" and set it as CLERK_WEBHOOK_SECRET env var
 */
export async function POST(request: Request) {
  // ── Verify webhook signature ─────────────────────────────────
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "CLERK_WEBHOOK_SECRET is not set. Webhook signature verification disabled."
    );
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers — request is not from Clerk" },
      { status: 400 }
    );
  }

  let payload: string;
  let evt: Record<string, unknown>;

  try {
    payload = await request.text();
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Record<string, unknown>;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // ── Process event ────────────────────────────────────────────
  try {
    const { type, data } = evt as {
      type: string;
      data: Record<string, unknown>;
    };

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id as string;
      const emailAddresses = data.email_addresses as Array<{
        email_address: string;
      }> | undefined;
      const email = emailAddresses?.[0]?.email_address || "";
      const firstName = (data.first_name as string) || "";
      const lastName = (data.last_name as string) || "";
      const name =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : firstName || email.split("@")[0];
      const avatarUrl = (data.image_url as string) || null;

      // Check if user exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (existingUser) {
        // Update existing user (preserve existing role & isActive)
        await db
          .update(users)
          .set({
            email,
            name,
            avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, clerkId));

        // Sync role to Clerk public metadata for edge-level middleware checks
        try {
          const client = await clerkClient();
          await client.users.updateUser(clerkId, {
            publicMetadata: { role: existingUser.role },
          });
        } catch (e) {
          console.error("Failed to sync role to Clerk metadata:", e);
        }
      } else {
        // Create new user (default role is customer, inactive until approved)
        await db.insert(users).values({
          clerkId,
          email,
          name,
          avatarUrl,
          role: "customer",
          isActive: false,
        });

        // Sync default role to Clerk public metadata
        try {
          const client = await clerkClient();
          await client.users.updateUser(clerkId, {
            publicMetadata: { role: "customer" },
          });
        } catch (e) {
          console.error("Failed to sync role to Clerk metadata:", e);
        }
      }
    }

    if (type === "user.deleted") {
      const clerkId = data.id as string;
      await db.delete(users).where(eq(users.clerkId, clerkId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
