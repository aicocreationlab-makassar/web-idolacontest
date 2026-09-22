import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { generateRegistrationCode } from "../src/lib/business-rules";
test("Migrations, RLS and full database lifecycle", async () => {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon,service_role;grant execute on function auth.uid() to authenticated,anon,service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create publication supabase_realtime;`,
  );
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  const admin = "00000000-0000-4000-8000-000000000001",
    judge = "00000000-0000-4000-8000-000000000002";
  await db.query(`insert into auth.users values($1),($2)`, [admin, judge]);
  await db.query(
    `insert into admin_profiles(user_id,display_name,role) values($1,'Test admin','super_admin'),($2,'Test judge','judge')`,
    [admin, judge],
  );
  await db.exec(
    `update seasons set registration_open_at=now()-interval '1 day',registration_close_at=now()+interval '1 day',submission_global_close_at=now()+interval '1 day',judging_at=now()+interval '2 days',announcement_at=now()+interval '3 days',shipping_at=now()+interval '4 days',quota=2;`,
  );
  const data = {
    full_name: "Test Child",
    public_name: "Little Star",
    age: 7,
    school_name: "Test School",
    parent_name: "PRIVATE PARENT",
    whatsapp: "081234567890",
    instagram_username: "test",
    address_line: "PRIVATE ADDRESS",
    province_code: "73",
    province_name: "Sulawesi Selatan",
    regency_code: "7371",
    regency_name: "Makassar",
    district_code: "7371010",
    district_name: "Test District",
    village_code: "7371010001",
    village_name: "Test Village",
    postal_code: "90111",
    competition_type: "coloring",
    category: "tk",
    dream_job: "Dokter",
    class_label: "TK",
    consent_parent_guardian: true,
    consent_publication: true,
    consent_terms: true,
    consent_fee: true,
  };
  const code = generateRegistrationCode();
  const register = async (payload: object, c = generateRegistrationCode()) =>
    (
      await db.query<{ id: string }>(
        `select create_registration($1::jsonb,$2,'test.webp',1024) as id`,
        [JSON.stringify(payload), c],
      )
    ).rows[0].id;
  await assert.rejects(() => register({ ...data, category: "preschool" }));
  await assert.rejects(() => register({ ...data, consent_fee: false }));
  const rid = await register(data, code);
  assert.ok(rid);
  await assert.rejects(() =>
    db.query(`select create_submission($1,'work.webp')`, [code]),
  );
  await db.exec("set role anon");
  await assert.rejects(() => db.query("select * from participants"));
  await assert.rejects(() => db.query("select * from registrations"));
  await assert.rejects(() =>
    db.query(`select create_registration('{}','x','x',1)`),
  );
  await assert.rejects(() =>
    db.query(`select admin_mutate('payment',$1,'{"status":"paid"}')`, [rid]),
  );
  await assert.rejects(() =>
    db.query(`select admin_review_registration($1,'approved','invalid')`, [
      rid,
    ]),
  );
  assert.equal((await db.query("select * from public_gallery")).rows.length, 0);
  await db.exec("reset role");
  async function asUser(id: string) {
    await db.exec("reset role");
    await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [id]);
    await db.exec("set role authenticated");
  }
  async function mutate(action: string, id: string, payload: object = {}) {
    await db.query("select admin_mutate($1,$2,$3::jsonb)", [
      action,
      id,
      JSON.stringify(payload),
    ]);
  }
  await asUser(admin);
  await db.query(
    `select admin_review_registration($1,'approved','Data peserta valid')`,
    [rid],
  );
  await mutate("payment", rid, { status: "paid", note: "verified" });
  assert.deepEqual(
    (
      await db.query<{ review_status: string; registration_status: string }>(
        "select review_status,registration_status from registrations where id=$1",
        [rid],
      )
    ).rows[0],
    { review_status: "approved", registration_status: "verified" },
  );
  assert.equal(
    (await db.query("select * from public_recent_registrations")).rows.length,
    1,
  );
  await mutate("worksheet", rid, { path: "worksheet.webp" });
  assert.equal((await db.query("select * from worksheets")).rows.length, 1);
  await db.exec("reset role");
  const sid = (
    await db.query<{ id: string }>(
      `select create_submission($1,'work.webp') id`,
      [code],
    )
  ).rows[0].id;
  assert.equal((await db.query("select * from public_gallery")).rows.length, 0);
  await assert.rejects(() =>
    db.query(`select create_submission($1,'duplicate.webp')`, [code]),
  );
  await asUser(admin);
  await assert.rejects(() => mutate("publish", sid, { path: "public.webp" }));
  await mutate("review", sid, { status: "approved", note: "Reviewed" });
  assert.equal((await db.query("select * from public_gallery")).rows.length, 0);
  await mutate("publish", sid, { path: "public.webp" });
  const gallery = (await db.query("select * from public_gallery")).rows;
  assert.equal(gallery.length, 1);
  const projection = JSON.stringify(gallery);
  assert.ok(!projection.includes("PRIVATE"));
  assert.ok(!projection.includes("whatsapp"));
  await assert.rejects(() => mutate("payment", rid, { status: "refunded" }));
  await asUser(judge);
  assert.equal((await db.query("select * from participants")).rows.length, 0);
  await assert.rejects(() => mutate("payment", rid, { status: "paid" }));
  await mutate("score", sid, {
    scores: [100, 80, 60, 40, 20],
    notes: "Human judging",
  });
  assert.equal(
    Number(
      (
        await db.query<{ total_score: string }>(
          "select total_score from judging_scores",
        )
      ).rows[0].total_score,
    ),
    70,
  );
  await assert.rejects(() =>
    mutate("score", sid, { scores: [101, 0, 0, 0, 0] }),
  );
  await asUser(admin);
  await mutate("award", rid, { award: "Juara Utama 1" });
  await assert.rejects(() =>
    mutate("result_publish", rid, { published: true }),
  );
  await assert.rejects(() => mutate("invoice", rid));
  await db.exec(
    `reset role;update seasons set registration_open_at=now()-interval '10 days',registration_close_at=now()-interval '7 days',submission_global_close_at=now()-interval '7 days',judging_at=now()-interval '6 days',announcement_at=now()-interval '5 days',shipping_at=now()-interval '1 day';`,
  );
  await assert.rejects(() => register(data));
  await assert.rejects(() =>
    db.query(`select create_submission($1,'late.webp')`, [code]),
  );
  await asUser(admin);
  await mutate("result_publish", rid, { published: true });
  assert.equal((await db.query("select * from public_results")).rows.length, 1);
  await mutate("invoice", rid);
  await assert.rejects(() =>
    mutate("shipment", rid, {
      courier: "J&T",
      tracking: "123",
      status: "shipped",
    }),
  );
  await mutate("claim_paid", rid);
  await mutate("shipment", rid, {
    courier: "J&T",
    tracking: "123",
    status: "shipped",
  });
  assert.equal(
    (
      await db.query<{ shipping_status: string }>(
        "select shipping_status from shipments",
      )
    ).rows[0].shipping_status,
    "shipped",
  );
  assert.ok(
    (await db.query("select * from admin_audit_logs")).rows.length >= 10,
  );
  await mutate("unpublish", sid);
  assert.equal((await db.query("select * from public_gallery")).rows.length, 0);
  await db.query(
    `select admin_review_registration($1,'rejected','Data perlu ditolak')`,
    [rid],
  );
  assert.equal(
    (
      await db.query<{ registration_status: string }>(
        "select registration_status from registrations where id=$1",
        [rid],
      )
    ).rows[0].registration_status,
    "cancelled",
  );
  await db.query(
    `select admin_review_registration($1,'approved','Diperiksa ulang')`,
    [rid],
  );
  await db.exec("reset role");
  assert.equal(
    (await db.query<{ ok: boolean }>(`select consume_rate_limit('test',1) ok`))
      .rows[0].ok,
    true,
  );
  assert.equal(
    (await db.query<{ ok: boolean }>(`select consume_rate_limit('test',1) ok`))
      .rows[0].ok,
    false,
  );
  await asUser(admin);
  await db.query("select admin_delete_registration($1)", [rid]);
  assert.equal((await db.query("select * from registrations")).rows.length, 0);
  assert.equal((await db.query("select * from participants")).rows.length, 0);
  assert.ok(
    (
      await db.query(
        "select * from admin_audit_logs where action='HARD_DELETE'",
      )
    ).rows.length >= 1,
  );
  await db.close();
});
