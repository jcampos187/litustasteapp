import { db } from "@/db";
import { weeklyMenus } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default async function WeeklyMenuHistoryPage() {
  const archivedMenus = await db
    .select()
    .from(weeklyMenus)
    .where(eq(weeklyMenus.isArchived, true))
    .orderBy(desc(weeklyMenus.createdAt));

  return (
    <div>
      <Link
        href="/admin/weekly-menu"
        className="mb-6 inline-flex items-center gap-1 text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
      >
        ← Volver al menú actual
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Historial de Menús
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Menús semanales anteriores
      </p>

      <div className="mt-8 space-y-3">
        {archivedMenus.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-lt-cream-dark" />
            <p className="mt-3 text-lg font-medium text-lt-charcoal/60">
              No hay menús archivados
            </p>
          </div>
        ) : (
          archivedMenus.map((menu) => (
            <div
              key={menu.id}
              className="rounded-2xl border border-lt-cream-dark bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lt-warm-brown">{menu.label}</p>
                  <p className="text-sm text-lt-charcoal/50">
                    {new Date(menu.weekStart).toLocaleDateString("es-CR")} —{" "}
                    {new Date(menu.weekEnd).toLocaleDateString("es-CR")}
                  </p>
                </div>
                <span className="text-sm text-lt-charcoal/40">
                  {menu.isPublished ? "Publicado" : "Borrador"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
