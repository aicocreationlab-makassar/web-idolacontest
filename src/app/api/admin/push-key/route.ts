import { admin } from "@/lib/supabase/server";
import { failure, json } from "@/lib/http";
import { getVapidKeys } from "@/lib/push-notifications";

/** Public VAPID key for the admin's browser; generated server-side when no env key exists. */
export async function GET() {
  try {
    await admin(["admin", "super_admin"]);
    const keys = await getVapidKeys();
    if (!keys)
      return json(
        {
          error:
            "Kunci notifikasi belum dapat dibuat. Terapkan migration 202610090001 (tabel app_config) lalu coba lagi.",
        },
        503,
      );
    return json({ publicKey: keys.publicKey });
  } catch (error) {
    return failure(error);
  }
}
