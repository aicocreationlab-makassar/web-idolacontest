-- Season 2 "Lomba Anak Nasional Online" (contest mode: national).
-- Run AFTER supabase/migrations/202610100001_contest_modes.sql.
-- The season is inserted INACTIVE: activate it from Admin → Season & Tema when ready.
-- Website texts come from the code defaults (src/lib/contest-modes.ts) until the
-- admin edits them in the season's "Konten website" editor.

insert into public.seasons(
  name, slug, theme_key, theme_title, tagline, description,
  contest_mode, registration_fee, claim_fee, quota,
  registration_open_at, registration_close_at, submission_global_close_at,
  judging_at, announcement_at, shipping_at,
  prize_preparation_start, prize_preparation_end, content, is_active
) values (
  'Season 2', 'S2', 'rainbow', 'Bebas', 'Lomba Anak Nasional Online',
  'Lomba fotogenik dan mewarnai online bertema bebas untuk kategori Baby (0–4 tahun) dan Kids (5–13 tahun). Hadiah uang tunai, piala, dan sertifikat untuk tiap kategori. Semua gratis setelah menang, tanpa penebusan.',
  'national', 35000, 0, 200,
  '2026-10-10 00:00:00+07', '2026-10-19 23:59:59+07', '2026-10-19 23:59:59+07',
  '2026-10-20 08:00:00+07', '2026-10-20 20:00:00+07', '2026-10-22 10:00:00+07',
  '2026-10-20', '2026-10-21', '{}'::jsonb, false
)
on conflict (slug) do nothing;

insert into public.event_settings(season_id, key, value)
select id, 'fees', '{"registration":35000,"claim":0,"free_shipping":true}'::jsonb
from public.seasons where slug = 'S2'
on conflict (season_id, key) do update set value = excluded.value, updated_at = now();

insert into public.event_settings(season_id, key, value)
select id, 'timeline', jsonb_build_object(
  'timezone', 'Asia/Jakarta',
  'prize_preparation_start', '2026-10-20',
  'prize_preparation_end', '2026-10-21')
from public.seasons where slug = 'S2'
on conflict (season_id, key) do nothing;
