import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { User, Bell } from "lucide-react";
import ProfileForm from "./ProfileForm";
import PushSubscribeButton from "@/components/PushSubscribeButton";

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

      {/* Push notification preferences */}
      <div className="mt-8 rounded-2xl border border-lt-cream-dark bg-white p-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-lt-terracotta" />
          <div>
            <h2 className="font-semibold text-lt-warm-brown">
              Notificaciones Push
            </h2>
            <p className="text-sm text-lt-charcoal/60">
              Recibe notificaciones cuando se publique un nuevo menú semanal
            </p>
          </div>
        </div>
        <div className="mt-4">
          <PushSubscribeButton />
        </div>
      </div>
    </div>
  );
}
