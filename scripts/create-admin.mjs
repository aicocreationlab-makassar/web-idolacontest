import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL || "admin@idolacontest.my.ud";
const password = process.env.ADMIN_PASSWORD;
if (!url || !key || !password)
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan ADMIN_PASSWORD.",
  );
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const {
  data: { users },
  error: listError,
} = await db.auth.admin.listUsers();
if (listError) throw listError;
let user = users.find((item) => item.email === email);
if (!user) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  user = data.user;
}
const { error } = await db
  .from("admin_profiles")
  .upsert({
    user_id: user.id,
    display_name: "Administrator Idola Contest",
    role: "super_admin",
  });
if (error) throw error;
console.log(`Admin ${email} siap digunakan.`);
