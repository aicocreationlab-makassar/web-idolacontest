import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const configured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
export function service() {
  if (!configured())
    throw new Error("Layanan belum dikonfigurasi. Silakan coba lagi nanti.");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function session() {
  const jar = await cookies();
  if (!configured()) throw new Error("Layanan belum dikonfigurasi.");
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server components cannot write cookies; proxy refreshes them. */
          }
        },
      },
    },
  );
}
export async function admin(roles = ["super_admin", "admin", "judge"]) {
  const db = await session();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) throw new Error("Silakan login admin.");
  const { data } = await db
    .from("admin_profiles")
    .select("user_id,role,display_name")
    .eq("user_id", user.id)
    .single();
  if (!data || !roles.includes(data.role)) throw new Error("Akses ditolak.");
  return { db, user, profile: data };
}
