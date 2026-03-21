import webpush from "web-push";
import { prisma } from "./db";

webpush.setVapidDetails(
  "mailto:contact@lomhea.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function sendPushNotification(
  userId: string,
  payload: { title: string; body: string; url: string },
) {
  try {
    const subscriptions = await (prisma as any).pushSubscription.findMany({
      where: { userId },
    });

    const pushPromises = subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload),
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription has expired or is no longer valid
          await (prisma as any).pushSubscription.delete({
            where: { id: sub.id },
          });
        }
      }
    });

    await Promise.all(pushPromises);
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
}
