import { readForm } from "@/lib/request-body";
import { z } from "zod";
import { session } from "@/lib/supabase/server";
import { failure, json, rateLimit } from "@/lib/http";
export async function POST(req: Request) {
  try {
    await rateLimit(req, "login", 8);
    const form = await readForm(req);
    const credentials = z
      .object({
        email: z.email().max(254),
        password: z.string().min(8).max(256),
      })
      .parse(Object.fromEntries(form));
    const db = await session();
    const { error } = await db.auth.signInWithPassword(credentials);
    if (error) throw new Error("Akses ditolak. Periksa email dan password.");
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) throw new Error("Akses ditolak.");
    const { data } = await db
      .from("admin_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) {
      await db.auth.signOut();
      throw new Error("Akses ditolak. Akun bukan admin.");
    }
    return json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
