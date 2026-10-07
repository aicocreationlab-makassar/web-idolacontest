-- Season administration uses calendar dates in WIB.  The rest of the
-- timeline is derived consistently so admins never need to enter timestamps.

create or replace function public.season_open_at(p_date date)
returns timestamptz language sql immutable set search_path=public as $$
  select (p_date + time '00:00:00') at time zone 'Asia/Jakarta'
$$;

create or replace function public.season_close_at(p_date date)
returns timestamptz language sql immutable set search_path=public as $$
  select (p_date + time '23:59:59') at time zone 'Asia/Jakarta'
$$;

create or replace function public.assert_season_dates(
  p_open_date date,
  p_close_date date
) returns void language plpgsql immutable set search_path=public as $$
begin
  if p_open_date is null or p_close_date is null then
    raise exception 'Tanggal buka dan tutup wajib diisi';
  end if;
  if p_open_date > p_close_date then
    raise exception 'Tanggal tutup harus sama atau setelah tanggal buka';
  end if;
end$$;

create or replace function public.update_active_season_dates(
  p_season_id uuid,
  p_open_date date,
  p_close_date date
) returns void language plpgsql security definer set search_path=public as $$
declare
  v_open timestamptz;
  v_close timestamptz;
  v_judging timestamptz;
  v_announcement timestamptz;
  v_shipping timestamptz;
begin
  if public.admin_role() is distinct from 'super_admin' then
    raise exception 'Super admin required';
  end if;
  perform public.assert_season_dates(p_open_date, p_close_date);

  v_open := public.season_open_at(p_open_date);
  v_close := public.season_close_at(p_close_date);
  v_judging := public.season_open_at(p_close_date + 1);
  v_announcement := public.season_open_at(p_close_date + 2);
  v_shipping := public.season_open_at(p_close_date + 7);

  update public.seasons
  set registration_open_at = v_open,
      registration_close_at = v_close,
      submission_global_close_at = v_close,
      judging_at = v_judging,
      announcement_at = v_announcement,
      shipping_at = v_shipping,
      updated_at = now()
  where id = p_season_id
    and is_active;

  if not found then
    raise exception 'Season aktif tidak ditemukan';
  end if;

  insert into public.event_settings(season_id, key, value)
  values (
    p_season_id,
    'timeline',
    jsonb_build_object(
      'timezone', 'Asia/Jakarta',
      'prize_preparation_start', (p_close_date + 3)::text,
      'prize_preparation_end', (p_close_date + 6)::text
    )
  )
  on conflict (season_id, key) do update
  set value = excluded.value,
      updated_at = now();
end$$;

create or replace function public.create_next_season(
  p_name text,
  p_open_date date,
  p_close_date date
) returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_next_number integer;
  v_slug text;
  v_id uuid;
  v_open timestamptz;
  v_close timestamptz;
begin
  if public.admin_role() is distinct from 'super_admin' then
    raise exception 'Super admin required';
  end if;
  if length(v_name) < 2 or length(v_name) > 80 then
    raise exception 'Nama season harus terdiri dari 2 sampai 80 karakter';
  end if;
  perform public.assert_season_dates(p_open_date, p_close_date);
  if exists (select 1 from public.seasons where lower(name) = lower(v_name)) then
    raise exception 'Nama season sudah digunakan';
  end if;

  -- Avoid duplicate season numbers when two tabs submit at the same time.
  perform pg_advisory_xact_lock(hashtext('idola_contest_create_next_season'));
  select coalesce(
    max(nullif(substring(slug from '^S([0-9]+)$'), '')::integer),
    0
  ) + 1
  into v_next_number
  from public.seasons;
  v_slug := 'S' || v_next_number::text;
  v_open := public.season_open_at(p_open_date);
  v_close := public.season_close_at(p_close_date);

  -- A new season becomes the only active season. Earlier seasons remain in
  -- public results after their winners have been published.
  update public.seasons set is_active = false, updated_at = now()
  where is_active;

  insert into public.seasons(
    name, slug, registration_open_at, registration_close_at,
    submission_global_close_at, judging_at, announcement_at, shipping_at,
    is_active
  ) values (
    v_name,
    v_slug,
    v_open,
    v_close,
    v_close,
    public.season_open_at(p_close_date + 1),
    public.season_open_at(p_close_date + 2),
    public.season_open_at(p_close_date + 7),
    true
  ) returning id into v_id;

  insert into public.event_settings(season_id, key, value)
  values
    (v_id, 'fees', '{"registration":20000,"claim":120000,"free_shipping":true}'::jsonb),
    (
      v_id,
      'timeline',
      jsonb_build_object(
        'timezone', 'Asia/Jakarta',
        'prize_preparation_start', (p_close_date + 3)::text,
        'prize_preparation_end', (p_close_date + 6)::text
      )
    );

  return v_id;
end$$;

revoke all on function public.season_open_at(date) from public, anon, authenticated;
revoke all on function public.season_close_at(date) from public, anon, authenticated;
revoke all on function public.assert_season_dates(date, date) from public, anon, authenticated;
revoke all on function public.update_active_season_dates(uuid, date, date) from public, anon;
revoke all on function public.create_next_season(text, date, date) from public, anon;
grant execute on function public.update_active_season_dates(uuid, date, date) to authenticated;
grant execute on function public.create_next_season(text, date, date) to authenticated;

-- The public registration ticker only follows the active season. Previous
-- seasons are represented publicly by their published winners, not by a live
-- registration feed.
create or replace view public.public_recent_registrations
with (security_barrier=true) as
select p.public_name, r.competition_type, r.created_at, r.season_id
from public.registrations r
join public.participants p on p.id = r.participant_id
where r.payment_status = 'paid'
  and r.registration_status = 'verified'
  and r.consent_publication
order by r.created_at desc
limit 10;

grant select on public.public_recent_registrations to anon, authenticated, service_role;
