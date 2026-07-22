import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notifyAdminNewRegistration } from "@/lib/email";
import { sendNewRegistrationWhatsApp } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, lastName, email, phone, deliveryAddress, city, password } = body;

    // Validate required fields
    if (!name || !lastName || !email || !phone || !deliveryAddress || !password) {
      return NextResponse.json(
        { error: "Todos los campos marcados con * son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Check if email already exists in our DB
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "Este correo ya está registrado" },
        { status: 409 }
      );
    }

    // 1. Create user in Clerk via Backend API
    const clerkRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        password,
        first_name: name,
        public_metadata: {
          source: "litus-taste-registration",
        },
      }),
    });

    if (!clerkRes.ok) {
      const clerkError = await clerkRes.text();
      console.error("Clerk API error:", clerkError);

      // Check if user already exists in Clerk
      if (clerkRes.status === 422) {
        return NextResponse.json(
          { error: "Este correo ya está registrado" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Error al crear la cuenta. Intenta de nuevo." },
        { status: 500 }
      );
    }

    const clerkUser = await clerkRes.json();
    const clerkId = clerkUser.id;

    const fullName = `${name} ${lastName}`.trim();

    // 2. Create user in our DB with approval pending
    await db.insert(users).values({
      clerkId,
      email,
      name, // first name
      lastName,
      phone,
      deliveryAddress,
      city: city || null,
      role: "customer",
      isActive: false, // pending approval
      profileComplete: true, // they filled everything
    });

    // 3. Notify admin about the new registration
    await notifyAdminNewRegistration(fullName, email, phone, deliveryAddress, city).catch(console.error);
    await sendNewRegistrationWhatsApp(fullName, email, phone).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Cuenta creada. Espera la aprobación del administrador.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Error al crear la cuenta. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
