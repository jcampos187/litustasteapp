import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { UserCheck } from "lucide-react";
import ApproveUserButton from "./ApproveUserButton";

export default async function AdminApprovalsPage() {
  const pendingUsers = await db
    .select()
    .from(users)
    .where(eq(users.isActive, false))
    .orderBy(desc(users.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Aprobaciones Pendientes
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        {pendingUsers.length} usuario{pendingUsers.length !== 1 ? "s" : ""} pendiente{pendingUsers.length !== 1 ? "s" : ""} de aprobación
      </p>

      {pendingUsers.length === 0 ? (
        <div className="mt-16 text-center">
          <UserCheck className="mx-auto h-16 w-16 text-lt-cream-dark" />
          <p className="mt-4 text-lg font-medium text-lt-charcoal/60">
            No hay usuarios pendientes de aprobación
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {pendingUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-lt-cream-dark bg-white p-6 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lt-terracotta/10 to-lt-gold/10">
                    <span className="text-lg font-bold text-lt-terracotta">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lt-warm-brown">
                      {`${user.name || ""} ${user.lastName || ""}`.trim() || "Sin nombre"}
                    </h3>
                    <p className="text-sm text-lt-charcoal/60">{user.email}</p>
                    <div className="mt-2 space-y-1 text-sm text-lt-charcoal/50">
                      {user.phone && <p>📞 {user.phone}</p>}
                      {user.deliveryAddress && <p>📍 {user.deliveryAddress}{user.city ? `, ${user.city}` : ""}</p>}
                    </div>
                    <p className="mt-2 text-xs text-lt-charcoal/40">
                      Registrado: {new Date(user.createdAt).toLocaleDateString("es-CR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ApproveUserButton
                    userId={user.id}
                    action="approve"
                    clerkId={user.clerkId}
                  />
                  <ApproveUserButton
                    userId={user.id}
                    action="decline"
                    clerkId={user.clerkId}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
