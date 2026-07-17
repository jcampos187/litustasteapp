import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { businessSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { settingsSchema } from "@/lib/validations";
import { z } from "zod";
import type { User } from "@/db/schema";

type AdminCheckResult =
  | { ok: true; dbUser: User }
  | { ok: false; error: string; status: number };

async function checkAdmin(userId: string | null): Promise<AdminCheckResult> {
  if (!userId) {
    return { ok: false, error: "No autorizado", status: 401 };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser || dbUser.role !== "admin") {
    return { ok: false, error: "No autorizado", status: 403 };
  }

  return { ok: true, dbUser };
}

export async function POST(request: Request) {
  const { userId } = await auth();
  const adminCheck = await checkAdmin(userId);
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.parse(body);

    const [settings] = await db
      .insert(businessSettings)
      .values({
        businessName: parsed.businessName,
        description: parsed.description ?? null,
        contactEmail: parsed.contactEmail ?? null,
        contactPhone: parsed.contactPhone ?? null,
        address: parsed.address ?? null,
      })
      .returning();

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  const adminCheck = await checkAdmin(userId);
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.parse(body);

    const [existing] = await db.select().from(businessSettings).limit(1);

    if (!existing) {
      const [settings] = await db
        .insert(businessSettings)
        .values({
          businessName: parsed.businessName,
          description: parsed.description ?? null,
          contactEmail: parsed.contactEmail ?? null,
          contactPhone: parsed.contactPhone ?? null,
          address: parsed.address ?? null,
        })
        .returning();
      return NextResponse.json(settings);
    }

    const [updated] = await db
      .update(businessSettings)
      .set({
        businessName: parsed.businessName || existing.businessName,
        description: parsed.description ?? existing.description,
        contactEmail: parsed.contactEmail ?? existing.contactEmail,
        contactPhone: parsed.contactPhone ?? existing.contactPhone,
        address: parsed.address ?? existing.address,
        updatedAt: new Date(),
      })
      .where(eq(businessSettings.id, existing.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
