import { db } from "@/db";
import { pushSubscriptions, users } from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";
import SubscriptionDashboardClient from "./SubscriptionDashboardClient";

async function getPushStats() {
  try {
    const subResult = await db
      .select({ total: count() })
      .from(pushSubscriptions);

    const recentSubs = await db
      .select({
        id: pushSubscriptions.id,
        endpoint: pushSubscriptions.endpoint,
        userAgent: pushSubscriptions.userAgent,
        createdAt: pushSubscriptions.createdAt,
        userEmail: users.email,
        userName: users.name,
        userLastName: users.lastName,
      })
      .from(pushSubscriptions)
      .leftJoin(users, eq(pushSubscriptions.userId, users.id))
      .orderBy(desc(pushSubscriptions.createdAt))
      .limit(20);

    return {
      totalSubscriptions: subResult[0]?.total ?? 0,
      recentSubscriptions: recentSubs,
    };
  } catch {
    return {
      totalSubscriptions: 0,
      recentSubscriptions: [],
    };
  }
}

export default async function AdminSubscriptionsPage() {
  const stats = await getPushStats();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-lt-warm-brown">
        Notificaciones Push
      </h1>
      <p className="mt-1 text-sm text-lt-charcoal/60">
        Gestiona las suscripciones a notificaciones push
      </p>

      <SubscriptionDashboardClient
        totalSubscriptions={stats.totalSubscriptions}
        recentSubscriptions={stats.recentSubscriptions}
      />
    </div>
  );
}
