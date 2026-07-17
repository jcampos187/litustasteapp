import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-lt-terracotta" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-lt-warm-brown">
            Mi Perfil
          </h1>
          <p className="mt-1 text-lt-charcoal/60">
            Administra tu información personal, teléfono y dirección de entrega
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ProfileForm />
      </div>
    </div>
  );
}
