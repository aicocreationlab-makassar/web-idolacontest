import "server-only";
import webpush, { type PushSubscription } from "web-push";
import { service } from "./supabase/server";

type AdminPush = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

type VapidKeys = { publicKey: string; privateKey: string; subject: string };

let cached: VapidKeys | null = null;

/**
 * VAPID keys come from env vars when present; otherwise they are generated
 * once and kept in app_config so push works on any deployment without setup.
 */
export async function getVapidKeys(): Promise<VapidKeys | null> {
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@idolacontest.my.id";
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
    return {
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
      subject,
    };
  if (cached) return cached;
  try {
    const db = service();
    const { data } = await db
      .from("app_config")
      .select("value")
      .eq("key", "vapid")
      .maybeSingle();
    const stored = data?.value as { publicKey?: string; privateKey?: string } | null;
    if (stored?.publicKey && stored?.privateKey) {
      cached = { publicKey: stored.publicKey, privateKey: stored.privateKey, subject };
      return cached;
    }
    const generated = webpush.generateVAPIDKeys();
    const { error } = await db
      .from("app_config")
      .insert({ key: "vapid", value: generated });
    if (error) {
      // Another instance generated keys first; use theirs.
      const { data: again } = await db
        .from("app_config")
        .select("value")
        .eq("key", "vapid")
        .maybeSingle();
      const value = again?.value as { publicKey?: string; privateKey?: string } | null;
      if (!value?.publicKey || !value?.privateKey) return null;
      cached = { publicKey: value.publicKey, privateKey: value.privateKey, subject };
      return cached;
    }
    cached = { ...generated, subject };
    return cached;
  } catch {
    return null;
  }
}

export async function sendAdminPush(payload: AdminPush, adminUserId?: string) {
  const keys = await getVapidKeys();
  if (!keys) return;
  webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);
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
        // 404/410: the browser dropped the subscription. 403: signed with other keys.
        if (statusCode === 404 || statusCode === 410 || statusCode === 403)
          await service()
            .from("admin_push_subscriptions")
            .delete()
            .eq("endpoint", row.endpoint);
      }
    }),
  );
}
