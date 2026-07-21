import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject =
  process.env.VAPID_SUBJECT || "mailto:admin@litustaste.com";

let isConfigured = false;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  isConfigured = true;
}

export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Send a push notification to a single subscription.
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; icon?: string; url?: string }
) {
  if (!isConfigured) {
    console.warn("Push notifications not configured — missing VAPID keys");
    return;
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icon-192.png",
        badge: "/icon-192.png",
        data: {
          url: payload.url || "/menu",
        },
      })
    );
  } catch (error: unknown) {
    // If the subscription is expired or invalid, throw so caller can clean it up
    if (error instanceof webpush.WebPushError && error.statusCode === 410) {
      throw new Error("SUBSCRIPTION_EXPIRED");
    }
    throw error;
  }
}

/**
 * Send a push notification to multiple subscriptions.
 * Returns an array of expired subscription IDs to clean up.
 */
export async function sendPushNotificationToAll(
  subscriptions: Array<PushSubscription & { id: string }>,
  payload: { title: string; body: string; icon?: string; url?: string }
): Promise<string[]> {
  const expiredIds: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await sendPushNotification(sub, payload);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "SUBSCRIPTION_EXPIRED"
        ) {
          expiredIds.push(sub.id);
        } else {
          console.error("Failed to send push notification:", error);
        }
      }
    })
  );

  return expiredIds;
}
