import "server-only";
import webpush, { type PushSubscription } from "web-push";
import { service } from "./supabase/server";

type AdminPush = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

function pushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT,
  );
}

export async function sendAdminPush(payload: AdminPush, adminUserId?: string) {
  if (!pushConfigured()) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  let query = service()
    .from("admin_push_subscriptions")
    .select("endpoint,p256dh,auth");
  if (adminUserId) query = query.eq("admin_user_id", adminUserId);
  const { data, error } = await query;
  if (error || !data?.length) return;

  await Promise.allSettled(
    data.map(async (row) => {
      const subscription: PushSubscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      };
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload), {
          TTL: 86400,
          urgency: "high",
        });
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410)
          await service()
            .from("admin_push_subscriptions")
            .delete()
            .eq("endpoint", row.endpoint);
      }
    }),
  );
}
