-- Permanent winner records, server-held push configuration, and hard clean-up helpers.

-- 1. Server configuration that must not depend on deployment env vars (VAPID keys).
create table if not exists public.app_config(
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
revoke all on public.app_config from public, anon, authenticated;
grant select, insert, update, delete on public.app_config to service_role;

-- 2. Winners are snapshots taken when a result is announced. They survive the
--    deletion of the registration and keep their own copy of the artwork.
create table if not exists public.winners(
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete set null,
  registration_code text not null,
  award_code text not null,
  rank_position integer,
  final_score numeric,
  competition_type text not null,
  category text not null,
  public_name text not null,
  regency_name text,
  province_name text,
  image_path text,
  source_image_path text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(season_id, registration_code)
);
create index if not exists winners_season on public.winners(season_id, competition_type, category, rank_position);
alter table public.winners enable row level security;
revoke all on public.winners from public, anon, authenticated;
grant select on public.winners to authenticated;
drop policy if exists admin_read_winners on public.winners;
create policy admin_read_winners on public.winners for select to authenticated
  using (public.admin_role() in ('admin','super_admin'));
grant select, insert, update, delete on public.winners to service_role;
drop trigger if exists touch_updated_at on public.winners;
create trigger touch_updated_at before update on public.winners for each row execute function public.touch_updated_at();
drop trigger if exists audit on public.winners;
create trigger audit after insert or update or delete on public.winners for each row execute function public.audit_mutation();

-- Public projection: never exposes the registration code or registration id.
drop view if exists public.public_winners;
create view public.public_winners with (security_barrier=true) as
select w.id, w.season_id, w.award_code, w.rank_position, w.final_score, w.competition_type,
       w.category, w.public_name, w.regency_name, w.province_name, w.image_path, w.published_at,
       e.name as season_name, e.theme_title
from public.winners w join public.seasons e on e.id=w.season_id;
grant select on public.public_winners to anon, authenticated, service_role;

create or replace function public.upsert_winner(p_registration uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  insert into winners(season_id,registration_id,registration_code,award_code,rank_position,final_score,
    competition_type,category,public_name,regency_name,province_name,source_image_path,published_at)
  select r.season_id, r.id, r.registration_code, x.award_code, x.rank_position, x.final_score,
    r.competition_type, r.category, p.public_name, p.regency_name, p.province_name,
    (select s.private_file_path from submissions s where s.registration_id=r.id and s.status='approved' order by s.created_at desc limit 1),
    coalesce(x.published_at, now())
  from registrations r
  join participants p on p.id=r.participant_id
  join results x on x.registration_id=r.id
  where r.id=p_registration and x.is_published
  on conflict(season_id,registration_code) do update set
    registration_id=excluded.registration_id,
    award_code=excluded.award_code,
    rank_position=excluded.rank_position,
    final_score=excluded.final_score,
    public_name=excluded.public_name,
    regency_name=excluded.regency_name,
    province_name=excluded.province_name,
    source_image_path=coalesce(winners.source_image_path, excluded.source_image_path),
    updated_at=now();
end$$;
revoke all on function public.upsert_winner(uuid) from public, anon, authenticated;

-- Publishing a result now also records the winner; hiding it removes the snapshot.
create or replace function public.winners_after_result() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  -- Deleting a result row (registration clean-up, re-ranking) keeps the snapshot;
  -- only hiding a published result removes it.
  if TG_OP='DELETE' then
    return null;
  end if;
  if new.is_published then
    perform upsert_winner(new.registration_id);
  else
    delete from winners where registration_id=new.registration_id;
  end if;
  return null;
end$$;
drop trigger if exists winners_after_result on public.results;
create trigger winners_after_result after insert or update of is_published,award_code,rank_position,final_score or delete on public.results
for each row execute function public.winners_after_result();

-- Snapshot winners that were announced before this migration.
select public.upsert_winner(registration_id) from public.results where is_published;

-- Hard delete of one winner record (the API removes its storage objects first).
create or replace function public.admin_delete_winner(p_id uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare w winners;
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then raise exception 'Unauthorized'; end if;
  select * into w from winners where id=p_id for update;
  if w.id is null then raise exception 'Missing winner'; end if;
  insert into admin_audit_logs(admin_user_id,action,entity_type,entity_id,before_data)
    values(auth.uid(),'HARD_DELETE','winners',w.id,to_jsonb(w));
  delete from winners where id=w.id;
  return jsonb_build_object('image_path',w.image_path,'registration_id',w.registration_id);
end$$;
revoke all on function public.admin_delete_winner(uuid) from public, anon;
grant execute on function public.admin_delete_winner(uuid) to authenticated;

-- Withdraw every published work of a season from the public gallery. Returns the
-- public object paths so the API can delete them from storage. Winner copies are
-- separate objects and stay untouched.
create or replace function public.admin_unpublish_season(p_season uuid) returns setof text
language plpgsql security definer set search_path=public as $$
declare paths text[];
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then raise exception 'Unauthorized'; end if;
  select coalesce(array_agg(s.public_file_path),'{}') into paths
  from submissions s join registrations r on r.id=s.registration_id
  where r.season_id=p_season and s.publication_status='approved' and s.public_file_path is not null;
  insert into admin_audit_logs(admin_user_id,action,entity_type,entity_id,before_data)
    values(auth.uid(),'UNPUBLISH_SEASON','seasons',p_season,jsonb_build_object('season_id',p_season,'paths',to_jsonb(paths)));
  update submissions s set publication_status='hidden', public_file_path=null, updated_at=now()
  from registrations r
  where r.id=s.registration_id and r.season_id=p_season and s.publication_status='approved';
  return query select unnest(paths);
end$$;
revoke all on function public.admin_unpublish_season(uuid) from public, anon;
grant execute on function public.admin_unpublish_season(uuid) to authenticated;

-- Deleting a registration keeps the winner snapshot (FK set null) but drops everything else.
-- Season purge also leaves winners untouched.

do $$begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='winners') then
    execute 'alter publication supabase_realtime add table winners';
  end if;
end$$;
