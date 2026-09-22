import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !serviceKey || !publicKey) {
  console.error("CONFIG=INCOMPLETE");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const season = await db
  .from("seasons")
  .select("id", { count: "exact", head: true });
console.log(`REST=${season.error ? `ERROR:${season.error.code}` : "OK"}`);

const review = await db
  .from("registrations")
  .select("review_status", { count: "exact", head: true });
console.log(
  `REVIEW_SCHEMA=${review.error ? `MISSING_OR_ERROR:${review.error.code}` : "OK"}`,
);

const auth = createClient(url, publicKey, { auth: { persistSession: false } });
const login = await auth.auth.signInWithPassword({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
});
console.log(
  `ADMIN_LOGIN=${login.error ? `ERROR:${login.error.message}` : "OK"}`,
);

if (login.data.user) {
  const profile = await auth
    .from("admin_profiles")
    .select("role")
    .eq("user_id", login.data.user.id)
    .maybeSingle();
  console.log(
    `ADMIN_PROFILE=${profile.error ? `ERROR:${profile.error.code}` : profile.data?.role || "MISSING"}`,
  );
  const reviewRpc = await auth.rpc("admin_review_registration", {
    p_id: randomUUID(),
    p_status: "approved",
    p_note: "integration probe",
  });
  console.log(
    `REVIEW_RPC=${reviewRpc.error?.message.includes("Missing registration") ? "OK" : reviewRpc.error ? `ERROR:${reviewRpc.error.code}` : "UNEXPECTED"}`,
  );
  await auth.auth.signOut();
}
