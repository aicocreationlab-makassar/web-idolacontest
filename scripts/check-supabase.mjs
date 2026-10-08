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

const theme = await db
  .from("seasons")
  .select("theme_key,theme_title", { count: "exact", head: true });
console.log(
  `SEASON_THEME_SCHEMA=${theme.error ? `MISSING_OR_ERROR:${theme.error.code} (apply 202610080001_season_themes_auto_rankings.sql)` : "OK"}`,
);

const rankings = await db
  .from("results")
  .select("rank_position,award_source", { count: "exact", head: true });
console.log(
  `RESULT_RANKING_SCHEMA=${rankings.error ? `MISSING_OR_ERROR:${rankings.error.code} (apply 202610080001_season_themes_auto_rankings.sql)` : "OK"}`,
);

const push = await db
  .from("admin_push_subscriptions")
  .select("id", { count: "exact", head: true });
console.log(
  `PUSH_SCHEMA=${push.error ? `MISSING_OR_ERROR:${push.error.code}` : `OK (${push.count ?? 0} perangkat)`}`,
);
console.log(
  `PUSH_KEYS=${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT ? "OK" : "MISSING"}`,
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
  const leaderboard = await auth.rpc("admin_leaderboard", { p_season: null });
  console.log(
    `LEADERBOARD_RPC=${leaderboard.error ? `ERROR:${leaderboard.error.code} ${leaderboard.error.message}` : `OK (${leaderboard.data?.length ?? 0} baris)`}`,
  );
  const queue = await auth.rpc("admin_judging_queue", { p_season: null });
  console.log(
    `JUDGING_QUEUE_RPC=${queue.error ? `ERROR:${queue.error.code} ${queue.error.message}` : `OK (${queue.data?.length ?? 0} karya)`}`,
  );
  const dashboard = await auth.rpc("admin_dashboard", { p_season: null });
  console.log(
    `DASHBOARD_RPC=${dashboard.error ? `ERROR:${dashboard.error.code}` : dashboard.data && "juara" in dashboard.data ? "OK" : "OUTDATED (apply latest migration)"}`,
  );
  await auth.auth.signOut();
}
