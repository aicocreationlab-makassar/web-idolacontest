-- Postal code is optional. All event wall-clock times are expressed in WIB.
alter table public.participants alter column postal_code drop not null;
alter table public.participants drop constraint if exists participants_postal_code_check;
alter table public.participants
  add constraint participants_postal_code_check
  check (postal_code is null or postal_code ~ '^[0-9]{5}$');

create or replace function public.create_registration(
  p jsonb,
  p_code text,
  p_path text,
  p_size integer,
  p_actor uuid default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare e seasons; pid uuid; rid uuid;
begin
  if p_actor is not null and not exists(
    select 1 from admin_profiles
    where user_id=p_actor and role in ('admin','super_admin')
  ) then raise exception 'Unauthorized'; end if;
  perform set_config('app.actor',coalesce(p_actor::text,''),true);
  select * into e from seasons where is_active for update;
  if e.id is null or now()<e.registration_open_at or now()>e.registration_close_at
    then raise exception 'Registration closed'; end if;
  if e.quota is not null and (
    select count(*) from registrations
    where season_id=e.id and registration_status not in ('cancelled','disqualified')
  )>=e.quota then raise exception 'Quota full'; end if;
  insert into participants(
    full_name,public_name,age,school_name,parent_name,whatsapp,
    instagram_username,address_line,province_code,province_name,regency_code,
    regency_name,district_code,district_name,village_code,village_name,postal_code
  ) values(
    p->>'full_name',p->>'public_name',(p->>'age')::int,p->>'school_name',
    p->>'parent_name',p->>'whatsapp',p->>'instagram_username',p->>'address_line',
    p->>'province_code',p->>'province_name',p->>'regency_code',p->>'regency_name',
    p->>'district_code',p->>'district_name',p->>'village_code',p->>'village_name',
    nullif(trim(coalesce(p->>'postal_code','')),'')
  ) returning id into pid;
  insert into registrations(
    season_id,participant_id,registration_code,competition_type,category,
    dream_job,class_label,registration_source,consent_parent_guardian,
    consent_publication,consent_terms,consent_fee
  ) values(
    e.id,pid,p_code,p->>'competition_type',p->>'category',p->>'dream_job',
    p->>'class_label',case when p_actor is null then 'website'
      else coalesce(p->>'registration_source','admin_manual') end,
    (p->>'consent_parent_guardian')::boolean,
    (p->>'consent_publication')::boolean,
    (p->>'consent_terms')::boolean,(p->>'consent_fee')::boolean
  ) returning id into rid;
  insert into participant_media(
    registration_id,storage_path,mime_type,size_bytes
  ) values(rid,p_path,'image/webp',p_size);
  insert into payments(registration_id,payment_type,amount)
  values(rid,'registration',20000);
  return rid;
end$$;

update public.seasons
set registration_open_at='2026-09-21 00:00:00+07',
    registration_close_at='2026-10-06 23:59:59+07',
    submission_global_close_at='2026-10-06 23:59:59+07',
    judging_at='2026-10-07 00:00:00+07',
    announcement_at='2026-10-08 00:00:00+07',
    shipping_at='2026-10-13 00:00:00+07',
    updated_at=now()
where slug='S1';

update public.event_settings
set value = jsonb_set(value, '{timezone}', '"Asia/Jakarta"'::jsonb)
where key='timeline'
  and season_id=(select id from public.seasons where slug='S1');
