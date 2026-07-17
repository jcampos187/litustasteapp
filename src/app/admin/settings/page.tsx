import { db } from "@/db";
import { businessSettings } from "@/db/schema";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const [settings] = await db.select().from(businessSettings).limit(1);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Gestiona la información de tu negocio
      </p>

      <div className="mt-8 max-w-2xl">
        <SettingsForm settings={settings || null} />
      </div>
    </div>
  );
}
