-- Contest modes. A season runs either in the classic mode (Season 1 rules) or in the
-- national mode ("Lomba Anak Nasional Online": Baby & Kids, cash prizes, free claim).
-- Fees, categories, award names and the editable website content now live on the season.

-- 1. Seasons carry their mode, fees and editable content.
alter table public.seasons
  add column if not exists contest_mode text not null default 'classic',
  add column if not exists registration_fee integer not null default 20000,
  add column if not exists claim_fee integer not null default 120000,
  add column if not exists content jsonb not null default '{}'::jsonb;
alter table public.seasons drop constraint if exists seasons_contest_mode_check;
alter table public.seasons add constraint seasons_contest_mode_check
  check (contest_mode in ('classic','national'));
alter table public.seasons drop constraint if exists seasons_fees_check;
alter table public.seasons add constraint seasons_fees_check
  check (registration_fee >= 0 and claim_fee >= 0);
alter table public.seasons drop constraint if exists seasons_theme_key_check;
alter table public.seasons add constraint seasons_theme_key_check
  check (theme_key in ('sky','sunset','jungle','candy','ocean','galaxy',
    'rainbow','bubblegum','balloon','sunshine','carnival','unicorn'));

-- 2. The national mode registers Baby and Kids categories. The original inline
--    check was auto-named, so it is located by its definition.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid='public.registrations'::regclass and contype='c'
      and pg_get_constraintdef(oid) like '%category%'
      and pg_get_constraintdef(oid) like '%preschool%'
      and pg_get_constraintdef(oid) not like '%coloring%'
  loop
    execute format('alter table public.registrations drop constraint %I', c.conname);
  end loop;
end$$;
alter table public.registrations add constraint registrations_category_check
  check (category in ('preschool','paud','tk','sd_1_2','sd_3_4','sd_5_6','baby','kids'));

-- 3. Fees are per season, so payment amounts are no longer fixed numbers.
alter table public.payments drop constraint if exists correct_payment_amount;
alter table public.payments add constraint correct_payment_amount check (amount >= 0);
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid='public.claim_invoices'::regclass and contype='c'
      and pg_get_constraintdef(oid) like '%amount%'
  loop
    execute format('alter table public.claim_invoices drop constraint %I', c.conname);
  end loop;
end$$;
alter table public.claim_invoices add constraint claim_invoices_amount_check check (amount >= 0);
alter table public.claim_invoices
  add column if not exists confirmation jsonb,
  add column if not exists confirmed_at timestamptz;

-- 4. Award names depend on the mode (Best of the Best / Juara Umum / Harapan / Favorit).
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid='public.results'::regclass and contype='c'
      and pg_get_constraintdef(oid) like '%award_code%'
  loop
    execute format('alter table public.results drop constraint %I', c.conname);
  end loop;
end$$;
alter table public.results add constraint results_award_code_check
  check (length(award_code) between 1 and 60);

create or replace function public.auto_award_for_rank(p_rank integer, p_mode text) returns text
language sql immutable as $$
  select case
    when p_mode='national' then
      case p_rank
        when 1 then 'Best of the Best' when 2 then 'Juara Umum'
        when 3 then 'Juara Harapan' when 4 then 'Juara Favorit'
      end
    else
      case p_rank
        when 1 then 'Juara Utama 1' when 2 then 'Juara Utama 2' when 3 then 'Juara Utama 3'
        when 4 then 'Juara Harapan 1' when 5 then 'Juara Harapan 2' when 6 then 'Juara Harapan 3'
        when 7 then 'Juara Favorit 1' when 8 then 'Juara Favorit 2' when 9 then 'Juara Favorit 3'
      end
  end
$$;

create or replace function public.recompute_rankings(p_season uuid, p_competition text, p_category text)
returns void language plpgsql security definer set search_path=public as $$
declare rec record; v_mode text; v_limit integer;
begin
  select contest_mode into v_mode from seasons where id=p_season;
  v_mode:=coalesce(v_mode,'classic');
  v_limit:=case when v_mode='national' then 4 else 9 end;
  for rec in
    with scored as (
      select r.id as registration_id,
             round(avg(j.total_score)::numeric,2) as score,
             count(distinct j.judge_id) as judges,
             min(s.submitted_at) as submitted_at,
             min(r.created_at) as created_at
      from registrations r
      join submissions s on s.registration_id=r.id and s.status='approved'
      join judging_scores j on j.submission_id=s.id
      where r.season_id=p_season and r.competition_type=p_competition and r.category=p_category
        and r.payment_status='paid' and r.registration_status='verified'
      group by r.id)
    select registration_id, score, judges,
           row_number() over(order by score desc, submitted_at asc, created_at asc) as rn
    from scored
  loop
    if rec.rn <= v_limit then
      insert into results(registration_id,final_score,award_code,rank_position,judge_count,award_source)
      values(rec.registration_id,rec.score,auto_award_for_rank(rec.rn::int,v_mode),rec.rn,rec.judges,'auto')
      on conflict(registration_id) do update set
        final_score=case when results.is_published then results.final_score else excluded.final_score end,
        rank_position=excluded.rank_position,
        judge_count=excluded.judge_count,
        award_code=case when results.is_published or results.award_source='manual'
          then results.award_code else excluded.award_code end,
        updated_at=now();
    else
      update results set rank_position=rec.rn, judge_count=rec.judges,
        final_score=case when is_published then final_score else rec.score end, updated_at=now()
      where registration_id=rec.registration_id and (award_source='manual' or is_published);
      delete from results where registration_id=rec.registration_id
        and award_source='auto' and not is_published;
    end if;
  end loop;
  delete from results x using registrations r
  where r.id=x.registration_id and r.season_id=p_season
    and r.competition_type=p_competition and r.category=p_category
    and x.award_source='auto' and not x.is_published
    and not exists(
      select 1 from judging_scores j join submissions s on s.id=j.submission_id
      where s.registration_id=r.id and s.status='approved');
end$$;
revoke all on function public.recompute_rankings(uuid,text,text) from public,anon,authenticated;
drop function if exists public.auto_award_for_rank(integer);

-- 5. Registration charges the season's fee; the school is optional for babies.
create or replace function public.create_registration(
  p jsonb,
  p_code text,
  p_path text,
  p_size integer,
  p_actor uuid default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare
  e seasons;
  pid uuid;
  rid uuid;
begin
  if p_actor is not null and not exists(
    select 1 from admin_profiles
    where user_id=p_actor and role in ('admin','super_admin')
  ) then
    raise exception 'Unauthorized';
  end if;

  perform set_config('app.actor',coalesce(p_actor::text,''),true);
  select * into e from seasons where is_active for update;
  if e.id is null or now()<e.registration_open_at or now()>e.registration_close_at then
    raise exception 'Registration closed';
  end if;
  if e.quota is not null and (
    select count(*) from registrations
    where season_id=e.id and registration_status not in ('cancelled','disqualified')
  )>=e.quota then
    raise exception 'Quota full';
  end if;

  insert into participants(
    full_name,public_name,age,age_unit,school_name,parent_name,whatsapp,
    instagram_username,address_line,province_code,province_name,regency_code,
    regency_name,district_code,district_name,village_code,village_name,postal_code
  ) values(
    p->>'full_name',p->>'public_name',(p->>'age')::int,
    coalesce(nullif(p->>'age_unit',''),'years'),
    coalesce(nullif(trim(coalesce(p->>'school_name','')),''),'Belum sekolah'),
    p->>'parent_name',p->>'whatsapp',p->>'instagram_username',
    p->>'address_line',p->>'province_code',p->>'province_name',
    p->>'regency_code',p->>'regency_name',p->>'district_code',
    p->>'district_name',p->>'village_code',p->>'village_name',
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
  values(rid,'registration',coalesce(e.registration_fee,20000));
  return rid;
end$$;

-- 6. The claim invoice carries the season's claim fee. A free claim (fee 0) still
--    waits for the winner to confirm the address and payout account.
create or replace function public.ensure_claim_invoice(p_registration uuid) returns void
language plpgsql security definer set search_path=public as $$
declare v_fee integer;
begin
  select coalesce(e.claim_fee,120000) into v_fee
  from registrations r join seasons e on e.id=r.season_id
  where r.id=p_registration;
  if v_fee is null then raise exception 'Missing registration'; end if;
  insert into claim_invoices(registration_id,invoice_number,amount)
  values(p_registration,'INV-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),v_fee)
  on conflict(registration_id) do nothing;
  insert into payments(registration_id,payment_type,amount)
  values(p_registration,'award_claim',v_fee)
  on conflict(registration_id,payment_type) do nothing;
end$$;
revoke all on function public.ensure_claim_invoice(uuid) from public,anon,authenticated;

-- Winners of a free claim confirm their shipping address and cash-prize account
-- from Cek Status (called by the server with the registration code only).
create or replace function public.confirm_free_claim(p_code text, p_data jsonb) returns void
language plpgsql security definer set search_path=public as $$
declare r registrations; c claim_invoices; v jsonb;
begin
  select * into r from registrations where registration_code=p_code;
  if r.id is null then raise exception 'Missing registration'; end if;
  select * into c from claim_invoices where registration_id=r.id for update;
  if c.id is null then raise exception 'Invoice required'; end if;
  if c.amount<>0 then raise exception 'Paid claim required'; end if;
  if c.status='paid' then return; end if;
  if c.status<>'issued' then raise exception 'Claim not open'; end if;
  if coalesce(p_data->>'address_ok','false')::boolean is not true then
    raise exception 'Address confirmation required';
  end if;
  v:=jsonb_build_object(
    'bank_name',left(trim(coalesce(p_data->>'bank_name','')),60),
    'bank_account',left(trim(coalesce(p_data->>'bank_account','')),40),
    'bank_holder',left(trim(coalesce(p_data->>'bank_holder','')),120),
    'note',left(trim(coalesce(p_data->>'note','')),300),
    'address_ok',true);
  if length(v->>'bank_name')<2 or length(v->>'bank_account')<4 or length(v->>'bank_holder')<2 then
    raise exception 'Bank details required';
  end if;
  update claim_invoices set status='paid',paid_at=now(),confirmation=v,confirmed_at=now() where id=c.id;
  update payments set status='paid',verified_at=now(),updated_at=now()
  where registration_id=r.id and payment_type='award_claim';
end$$;
revoke all on function public.confirm_free_claim(text,jsonb) from public,anon,authenticated;

-- 7. Season management saves the mode, fees and content.
create or replace function public.admin_save_season(p_id uuid, p jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare sid uuid; v_mode text; v_fee integer; v_claim integer; v_content jsonb;
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then raise exception 'Unauthorized'; end if;
  v_mode:=coalesce(nullif(p->>'contest_mode',''),'classic');
  v_fee:=nullif(p->>'registration_fee','')::int;
  v_claim:=nullif(p->>'claim_fee','')::int;
  v_content:=case when jsonb_typeof(p->'content')='object' then p->'content' else null end;
  if p_id is null then
    insert into seasons(name,slug,theme_key,theme_title,tagline,description,registration_open_at,registration_close_at,
      submission_global_close_at,judging_at,announcement_at,shipping_at,prize_preparation_start,prize_preparation_end,quota,is_active,
      contest_mode,registration_fee,claim_fee,content)
    values(trim(p->>'name'),upper(trim(p->>'slug')),coalesce(p->>'theme_key','sky'),trim(coalesce(p->>'theme_title','Cita Citaku')),
      nullif(trim(coalesce(p->>'tagline','')),''),nullif(trim(coalesce(p->>'description','')),''),
      (p->>'registration_open_at')::timestamptz,(p->>'registration_close_at')::timestamptz,
      (p->>'submission_global_close_at')::timestamptz,(p->>'judging_at')::timestamptz,(p->>'announcement_at')::timestamptz,
      (p->>'shipping_at')::timestamptz,nullif(p->>'prize_preparation_start','')::date,nullif(p->>'prize_preparation_end','')::date,
      nullif(p->>'quota','')::int,false,
      v_mode,
      coalesce(v_fee,case when v_mode='national' then 35000 else 20000 end),
      coalesce(v_claim,case when v_mode='national' then 0 else 120000 end),
      coalesce(v_content,'{}'::jsonb))
    returning id into sid;
    insert into event_settings(season_id,key,value) values
      (sid,'fees',jsonb_build_object(
        'registration',coalesce(v_fee,case when v_mode='national' then 35000 else 20000 end),
        'claim',coalesce(v_claim,case when v_mode='national' then 0 else 120000 end),
        'free_shipping',true)),
      (sid,'timeline',jsonb_build_object('timezone','Asia/Jakarta','prize_preparation_start',p->>'prize_preparation_start','prize_preparation_end',p->>'prize_preparation_end'))
    on conflict(season_id,key) do nothing;
  else
    update seasons set name=trim(p->>'name'),slug=upper(trim(p->>'slug')),theme_key=coalesce(p->>'theme_key',theme_key),
      theme_title=trim(coalesce(p->>'theme_title',theme_title)),tagline=nullif(trim(coalesce(p->>'tagline','')),''),
      description=nullif(trim(coalesce(p->>'description','')),''),
      registration_open_at=(p->>'registration_open_at')::timestamptz,registration_close_at=(p->>'registration_close_at')::timestamptz,
      submission_global_close_at=(p->>'submission_global_close_at')::timestamptz,judging_at=(p->>'judging_at')::timestamptz,
      announcement_at=(p->>'announcement_at')::timestamptz,shipping_at=(p->>'shipping_at')::timestamptz,
      prize_preparation_start=nullif(p->>'prize_preparation_start','')::date,prize_preparation_end=nullif(p->>'prize_preparation_end','')::date,
      quota=nullif(p->>'quota','')::int,
      contest_mode=v_mode,
      registration_fee=coalesce(v_fee,registration_fee),
      claim_fee=coalesce(v_claim,claim_fee),
      content=coalesce(v_content,content),
      updated_at=now()
    where id=p_id;
    if not found then raise exception 'Missing season'; end if;
    sid:=p_id;
    insert into event_settings(season_id,key,value)
    values(sid,'fees',jsonb_build_object(
      'registration',(select registration_fee from seasons where id=sid),
      'claim',(select claim_fee from seasons where id=sid),
      'free_shipping',true))
    on conflict(season_id,key) do update set value=excluded.value,updated_at=now();
  end if;
  return sid;
end$$;
revoke all on function public.admin_save_season(uuid,jsonb) from public,anon;
grant execute on function public.admin_save_season(uuid,jsonb) to authenticated;

-- 8. The leaderboard exposes the claim amount and the winner's confirmation so the
--    claims board can show free-claim confirmations.
drop function if exists public.admin_leaderboard(uuid);
create function public.admin_leaderboard(p_season uuid default null)
returns table(
  registration_id uuid, registration_code text, season_id uuid, competition_type text, category text,
  public_name text, full_name text, regency_name text, province_name text, whatsapp text,
  score numeric, judge_count bigint, rank_position integer, award_code text, award_source text,
  is_published boolean, published_at timestamptz, final_score numeric,
  claim_status text, invoice_number text, claim_paid_at timestamptz,
  shipping_status text, courier text, tracking_number text, shipped_at timestamptz,
  claim_amount integer, claim_confirmation jsonb
) language plpgsql stable security definer set search_path=public as $$
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then raise exception 'Unauthorized'; end if;
  return query
  with scored as (
    select sub.registration_id as rid, round(avg(j.total_score)::numeric,2) as score, count(distinct j.judge_id) as judges
    from judging_scores j join submissions sub on sub.id=j.submission_id
    where sub.status='approved' group by sub.registration_id)
  select r.id, r.registration_code, r.season_id, r.competition_type, r.category,
    p.public_name, p.full_name, p.regency_name, p.province_name, p.whatsapp,
    sc.score, coalesce(sc.judges,0), x.rank_position, x.award_code, x.award_source,
    coalesce(x.is_published,false), x.published_at, x.final_score,
    c.status, c.invoice_number, c.paid_at,
    h.shipping_status, h.courier, h.tracking_number, h.shipped_at,
    c.amount, c.confirmation
  from registrations r
  join participants p on p.id=r.participant_id
  left join scored sc on sc.rid=r.id
  left join results x on x.registration_id=r.id
  left join claim_invoices c on c.registration_id=r.id
  left join shipments h on h.registration_id=r.id
  where (p_season is null or r.season_id=p_season) and (sc.score is not null or x.id is not null)
  order by r.competition_type, r.category, coalesce(x.rank_position,999), sc.score desc nulls last, p.public_name;
end$$;
revoke all on function public.admin_leaderboard(uuid) from public,anon;
grant execute on function public.admin_leaderboard(uuid) to authenticated;
