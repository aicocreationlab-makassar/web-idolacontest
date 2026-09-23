import { z } from "zod";
import { admin, service } from "@/lib/supabase/server";
import { failure, json, rateLimit } from "@/lib/http";
import { readJson } from "@/lib/request-body";
import { sendAdminPush } from "@/lib/push-notifications";

const subscriptionSchema = z.object({
  endpoint: z.url().max(2048),
  keys: z.object({
    p256dh: z.string().min(20).max(512),
    auth: z.string().min(8).max(256),
  }),
});

export async function POST(request: Request) {
  try {
    await rateLimit(request, "push-subscription", 30);
    const { user } = await admin(["admin", "super_admin"]);
    const subscription = subscriptionSchema.parse(await readJson(request));
    const { error } = await service()
      .from("admin_push_subscriptions")
      .upsert(
        {
          admin_user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: request.headers.get("user-agent")?.slice(0, 500),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "endpoint" },
      );
    if (error) throw new Error("Data notifikasi belum dapat disimpan.");
    await sendAdminPush(
      {
        title: "Notifikasi Idola aktif!",
        body: "Pendaftaran dan karya baru akan langsung muncul di perangkat ini.",
        url: "/admin/dashboard",
        tag: "idola-push-ready",
      },
      user.id,
    );
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await rateLimit(request, "push-subscription", 30);
    const { user } = await admin(["admin", "super_admin"]);
    const { endpoint } = z
      .object({ endpoint: z.url().max(2048) })
      .parse(await readJson(request));
    const { error } = await service()
      .from("admin_push_subscriptions")
      .delete()
      .eq("admin_user_id", user.id)
      .eq("endpoint", endpoint);
    if (error) throw new Error("Data notifikasi belum dapat dihapus.");
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
