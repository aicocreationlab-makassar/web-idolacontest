-- Season themes, automatic rankings, automatic claim invoices and season management.

-- 1. Seasons carry their own theme, tagline and full timeline.
alter table public.seasons
  add column if not exists theme_key text not null default 'sky',
  add column if not exists theme_title text not null default 'Cita Citaku',
  add column if not exists tagline text,
  add column if not exists description text,
  add column if not exists prize_preparation_start date,
  add column if not exists prize_preparation_end date;
alter table public.seasons drop constraint if exists seasons_theme_key_check;
alter table public.seasons add constraint seasons_theme_key_check
  check (theme_key in ('sky','sunset','jungle','candy','ocean','galaxy'));
alter table public.seasons drop constraint if exists bounded_season_text;
alter table public.seasons add constraint bounded_season_text check (
  length(name) between 1 and 80 and length(theme_title) between 1 and 80
  and length(coalesce(tagline,'')) <= 160 and length(coalesce(description,'')) <= 600
);
update public.seasons
set prize_preparation_start='2026-10-09', prize_preparation_end='2026-10-12'
where slug='S1' and prize_preparation_start is null;

-- 2. Results remember their rank, how many judges scored and whether the award was automatic.
alter table public.results
  add column if not exists rank_position integer,
  add column if not exists judge_count integer not null default 0,
  add column if not exists award_source text not null default 'manual';
alter table public.results drop constraint if exists results_award_source_check;
alter table public.results add constraint results_award_source_check
  check (award_source in ('auto','manual'));

create or replace function public.auto_award_for_rank(p_rank integer) returns text
language sql immutable as $$
  select case p_rank
    when 1 then 'Juara Utama 1' when 2 then 'Juara Utama 2' when 3 then 'Juara Utama 3'
    when 4 then 'Juara Harapan 1' when 5 then 'Juara Harapan 2' when 6 then 'Juara Harapan 3'
    when 7 then 'Juara Favorit 1' when 8 then 'Juara Favorit 2' when 9 then 'Juara Favorit 3'
  end
$$;

-- Ranks every scored participant inside one season + competition + category group and
-- assigns the nine automatic awards. Manual awards and published results are never overwritten.
create or replace function public.recompute_rankings(p_season uuid, p_competition text, p_category text)
returns void language plpgsql security definer set search_path=public as $$
declare rec record;
begin
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
    if rec.rn <= 9 then
      insert into results(registration_id,final_score,award_code,rank_position,judge_count,award_source)
      values(rec.registration_id,rec.score,auto_award_for_rank(rec.rn::int),rec.rn,rec.judges,'auto')
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

create or replace function public.rankings_after_score() returns trigger
language plpgsql security definer set search_path=public as $$
declare r registrations;
begin
  select reg.* into r from registrations reg
  join submissions s on s.registration_id=reg.id
  where s.id=coalesce(new.submission_id,old.submission_id);
  if r.id is not null then
    perform recompute_rankings(r.season_id,r.competition_type,r.category);
  end if;
  return null;
end$$;
drop trigger if exists rankings_after_score on public.judging_scores;
create trigger rankings_after_score after insert or update or delete on public.judging_scores
for each row execute function public.rankings_after_score();

create or replace function public.rankings_after_registration_change() returns trigger
language plpgsql security definer set search_path=public as $$
declare r registrations;
begin
  if TG_TABLE_NAME='submissions' then
    select * into r from registrations where id=new.registration_id;
  else
    r:=new;
  end if;
  if r.id is not null then
    perform recompute_rankings(r.season_id,r.competition_type,r.category);
  end if;
  return null;
end$$;
drop trigger if exists rankings_after_submission on public.submissions;
create trigger rankings_after_submission after update of status on public.submissions
for each row when (old.status is distinct from new.status)
execute function public.rankings_after_registration_change();
drop trigger if exists rankings_after_registration on public.registrations;
create trigger rankings_after_registration after update of payment_status,registration_status on public.registrations
for each row when (old.payment_status is distinct from new.payment_status or old.registration_status is distinct from new.registration_status)
execute function public.rankings_after_registration_change();

-- 3. Public results no longer wait for a calendar date: publishing is the explicit admin decision.
drop view if exists public.public_results;
create view public.public_results with (security_barrier=true) as
select x.award_code,x.final_score,x.rank_position,x.published_at,p.public_name,p.regency_name,
       p.province_name,r.competition_type,r.category,r.season_id
from results x join registrations r on r.id=x.registration_id
join participants p on p.id=r.participant_id
where x.is_published and r.registration_status='verified' and r.consent_publication;
grant select on public.public_results to anon,authenticated,service_role;

-- 4. Issue the Rp120.000 claim invoice automatically for a published result.
create or replace function public.ensure_claim_invoice(p_registration uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  insert into claim_invoices(registration_id,invoice_number)
  values(p_registration,'INV-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)))
  on conflict(registration_id) do nothing;
  insert into payments(registration_id,payment_type,amount)
  values(p_registration,'award_claim',120000)
  on conflict(registration_id,payment_type) do nothing;
end$$;
revoke all on function public.ensure_claim_invoice(uuid) from public,anon,authenticated;

-- 5. Operational mutations. Same signature, clearer rules, new actions.
create or replace function public.admin_mutate(p_action text,p_id uuid,p_data jsonb) returns void
language plpgsql security definer set search_path=public as $$
declare role_name text; r registrations; s submissions; e seasons; v numeric; vals jsonb; i integer; rec record;
begin
  role_name:=admin_role();
  if role_name is null or (role_name='judge' and p_action<>'score') then raise exception 'Unauthorized'; end if;

  if p_action='score' then
    select * into s from submissions where id=p_id for update;
    if s.id is null then raise exception 'Missing submission'; end if;
    if s.status<>'approved' then raise exception 'Not approved'; end if;
    select * into r from registrations where id=s.registration_id;
    if exists(select 1 from results where registration_id=r.id and is_published) then raise exception 'Results locked'; end if;
    vals:=p_data->'scores';
    if vals is null or jsonb_typeof(vals)<>'array' or jsonb_array_length(vals)<>5 then raise exception 'Five scores required'; end if;
    for i in 0..4 loop
      if (vals->>i) is null or (vals->>i)::numeric not between 0 and 100 then raise exception 'Invalid score'; end if;
    end loop;
    v:=((vals->>0)::numeric*30+(vals->>1)::numeric*25+(vals->>2)::numeric*20+(vals->>3)::numeric*15+(vals->>4)::numeric*10)/100;
    insert into judging_scores(submission_id,judge_id,criteria,total_score,notes)
    values(p_id,auth.uid(),vals,v,nullif(trim(coalesce(p_data->>'notes','')),''))
    on conflict(submission_id,judge_id) do update set criteria=excluded.criteria,total_score=excluded.total_score,notes=excluded.notes,updated_at=now();
    return;

  elsif p_action in ('review','publish','unpublish') then
    select * into s from submissions where id=p_id for update;
    if s.id is null then raise exception 'Missing submission'; end if;
    select * into r from registrations where id=s.registration_id for update;
    if p_action='review' then
      if s.publication_status='approved' then raise exception 'Unpublish first'; end if;
      if p_data->>'status' not in ('approved','revision_required','rejected') then raise exception 'Invalid review'; end if;
      update submissions set status=p_data->>'status',review_note=nullif(trim(coalesce(p_data->>'note','')),''),reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() where id=p_id;
    elsif p_action='publish' then
      if s.status<>'approved' or r.payment_status<>'paid' or r.registration_status<>'verified' or not r.consent_publication then raise exception 'Not publishable'; end if;
      update submissions set publication_status='approved',public_file_path=p_data->>'path',updated_at=now() where id=p_id;
    else
      update submissions set publication_status='hidden',public_file_path=null,updated_at=now() where id=p_id;
    end if;
    return;

  elsif p_action='publish_group' then
    select * into e from seasons where id=p_id;
    if e.id is null then raise exception 'Missing season'; end if;
    for rec in
      select x.registration_id from results x join registrations reg on reg.id=x.registration_id
      where reg.season_id=e.id and reg.competition_type=p_data->>'competition' and reg.category=p_data->>'category'
    loop
      if (p_data->>'published')::boolean then
        update results set is_published=true,published_at=coalesce(published_at,now()),updated_at=now() where registration_id=rec.registration_id;
        perform ensure_claim_invoice(rec.registration_id);
      else
        update results set is_published=false,published_at=null,updated_at=now() where registration_id=rec.registration_id;
      end if;
    end loop;
    return;
  end if;

  select * into r from registrations where id=p_id for update;
  if r.id is null then raise exception 'Missing registration'; end if;
  select * into e from seasons where id=r.season_id;

  if p_action='payment' then
    if p_data->>'status' not in ('pending','paid','rejected','refunded') then raise exception 'Invalid payment'; end if;
    if p_data->>'status'<>'paid' and exists(select 1 from submissions where registration_id=r.id and publication_status='approved') then raise exception 'Unpublish first'; end if;
    update payments set status=p_data->>'status',verified_by=auth.uid(),verified_at=now(),admin_note=nullif(trim(coalesce(p_data->>'note','')),''),updated_at=now() where registration_id=r.id and payment_type='registration';
    update registrations set payment_status=p_data->>'status',updated_at=now() where id=r.id;

  elsif p_action='worksheet' then
    if r.competition_type<>'coloring' then raise exception 'Not eligible'; end if;
    if r.payment_status<>'paid' then raise exception 'Not paid'; end if;
    insert into worksheets(registration_id,private_file_path,version,created_by)
    select r.id,p_data->>'path',coalesce(max(version),0)+1,auth.uid() from worksheets where registration_id=r.id;

  elsif p_action='award' then
    if coalesce(p_data->>'award','')='auto' then
      update results set award_source='auto',updated_at=now() where registration_id=r.id;
      perform recompute_rankings(r.season_id,r.competition_type,r.category);
      return;
    end if;
    if r.payment_status<>'paid' then raise exception 'Not paid'; end if;
    select avg(j.total_score) into v from judging_scores j join submissions sub on sub.id=j.submission_id where sub.registration_id=r.id and sub.status='approved';
    insert into results(registration_id,final_score,award_code,award_source,judge_count)
    values(r.id,round(coalesce(v,0),2),p_data->>'award','manual',
      (select count(distinct j.judge_id) from judging_scores j join submissions sub on sub.id=j.submission_id where sub.registration_id=r.id and sub.status='approved'))
    on conflict(registration_id) do update set award_code=excluded.award_code,award_source='manual',updated_at=now();

  elsif p_action='result_publish' then
    if not exists(select 1 from results where registration_id=r.id) then raise exception 'Result required'; end if;
    if (p_data->>'published')::boolean then
      update results set is_published=true,published_at=coalesce(published_at,now()),updated_at=now() where registration_id=r.id;
      perform ensure_claim_invoice(r.id);
    else
      update results set is_published=false,published_at=null,updated_at=now() where registration_id=r.id;
    end if;

  elsif p_action='invoice' then
    if not exists(select 1 from results where registration_id=r.id) then raise exception 'Result required'; end if;
    perform ensure_claim_invoice(r.id);

  elsif p_action in ('claim_paid','claim_status') then
    if not exists(select 1 from claim_invoices where registration_id=r.id) then raise exception 'Invoice required'; end if;
    if p_action='claim_paid' or p_data->>'status'='paid' then
      update claim_invoices set status='paid',paid_at=coalesce(paid_at,now()) where registration_id=r.id;
      update payments set status='paid',verified_by=auth.uid(),verified_at=now(),updated_at=now() where registration_id=r.id and payment_type='award_claim';
    elsif p_data->>'status'='issued' then
      update claim_invoices set status='issued',paid_at=null where registration_id=r.id;
      update payments set status='pending',verified_by=null,verified_at=null,updated_at=now() where registration_id=r.id and payment_type='award_claim';
    elsif p_data->>'status'='cancelled' then
      if exists(select 1 from shipments where registration_id=r.id and shipping_status in ('shipped','delivered')) then raise exception 'Already shipped'; end if;
      update claim_invoices set status='cancelled' where registration_id=r.id;
      update payments set status='rejected',verified_by=auth.uid(),verified_at=now(),updated_at=now() where registration_id=r.id and payment_type='award_claim';
    else
      raise exception 'Invalid claim status';
    end if;

  elsif p_action='shipment' then
    if not exists(select 1 from claim_invoices where registration_id=r.id and status='paid') then raise exception 'Paid claim required'; end if;
    if p_data->>'status' not in ('waiting','prepared','shipped','delivered') then raise exception 'Invalid shipment'; end if;
    if p_data->>'status' in ('shipped','delivered') and coalesce(trim(p_data->>'tracking'),'')='' then raise exception 'Tracking required'; end if;
    if coalesce(trim(p_data->>'courier'),'')='' then raise exception 'Courier required'; end if;
    insert into shipments(registration_id,courier,tracking_number,shipping_status,shipped_at,delivered_at)
    values(r.id,trim(p_data->>'courier'),nullif(trim(coalesce(p_data->>'tracking','')),''),p_data->>'status',
      case when p_data->>'status' in ('shipped','delivered') then now() end,
      case when p_data->>'status'='delivered' then now() end)
    on conflict(registration_id) do update set courier=excluded.courier,tracking_number=excluded.tracking_number,
      shipping_status=excluded.shipping_status,
      shipped_at=case when excluded.shipping_status in ('shipped','delivered') then coalesce(shipments.shipped_at,now()) else null end,
      delivered_at=case when excluded.shipping_status='delivered' then coalesce(shipments.delivered_at,now()) else null end,
      updated_at=now();

  else
    raise exception 'Unknown action';
  end if;
end$$;
revoke all on function public.admin_mutate(text,uuid,jsonb) from public,anon;
grant execute on function public.admin_mutate(text,uuid,jsonb) to authenticated;

-- 6. Season management: create, edit, activate and delete seasons from the admin panel.
create or replace function public.admin_save_season(p_id uuid, p jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare sid uuid;
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then raise exception 'Unauthorized'; end if;
  if p_id is null then
    insert into seasons(name,slug,theme_key,theme_title,tagline,description,registration_open_at,registration_close_at,
      submission_global_close_at,judging_at,announcement_at,shipping_at,prize_preparation_start,prize_preparation_end,quota,is_active)
    values(trim(p->>'name'),upper(trim(p->>'slug')),coalesce(p->>'theme_key','sky'),trim(coalesce(p->>'theme_title','Cita Citaku')),
      nullif(trim(coalesce(p->>'tagline','')),''),nullif(trim(coalesce(p->>'description','')),''),
      (p->>'registration_open_at')::timestamptz,(p->>'registration_close_at')::timestamptz,
      (p->>'submission_global_close_at')::timestamptz,(p->>'judging_at')::timestamptz,(p->>'announcement_at')::timestamptz,
      (p->>'shipping_at')::timestamptz,nullif(p->>'prize_preparation_start','')::date,nullif(p->>'prize_preparation_end','')::date,
      nullif(p->>'quota','')::int,false)
    returning id into sid;
    insert into event_settings(season_id,key,value) values
      (sid,'fees','{"registration":20000,"claim":120000,"free_shipping":true}'::jsonb),
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
      quota=nullif(p->>'quota','')::int,updated_at=now()
    where id=p_id;
    if not found then raise exception 'Missing season'; end if;
    sid:=p_id;
  end if;
  return sid;
end$$;
revoke all on function public.admin_save_season(uuid,jsonb) from public,anon;
grant execute on function public.admin_save_season(uuid,jsonb) to authenticated;

create or replace function public.admin_activate_season(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then raise exception 'Unauthorized'; end if;
  if not exists(select 1 from seasons where id=p_id) then raise exception 'Missing season'; end if;
  update seasons set is_active=false,updated_at=now() where is_active and id<>p_id;
  update seasons set is_active=true,updated_at=now() where id=p_id and not is_active;
end$$;
revoke all on function public.admin_activate_season(uuid) from public,anon;
grant execute on function public.admin_activate_season(uuid) to authenticated;

create or replace function public.admin_delete_season(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if admin_role()<>'super_admin' or admin_role() is null then raise exception 'Super admin required'; end if;
  if exists(select 1 from seasons where id=p_id and is_active) then raise exception 'Season active'; end if;
  if exists(select 1 from registrations where season_id=p_id) then raise exception 'Season has registrations'; end if;
  delete from event_settings where season_id=p_id;
  delete from seasons where id=p_id;
end$$;
revoke all on function public.admin_delete_season(uuid) from public,anon;
grant execute on function public.admin_delete_season(uuid) to authenticated;

-- 7. Judging queue: approved works with public identity only, plus the caller's own score.
create or replace function public.admin_judging_queue(p_season uuid default null)
returns table(
  submission_id uuid, registration_id uuid, season_id uuid, competition_type text, category text,
  public_name text, submitted_at timestamptz, my_scores jsonb, my_total numeric, my_notes text,
  judge_count bigint, avg_score numeric, rank_position integer, award_code text, is_published boolean
) language plpgsql stable security definer set search_path=public as $$
begin
  if admin_role() is null then raise exception 'Unauthorized'; end if;
  return query
  select s.id, r.id, r.season_id, r.competition_type, r.category, p.public_name, s.submitted_at,
    mine.criteria, mine.total_score, mine.notes,
    (select count(distinct j.judge_id) from judging_scores j where j.submission_id=s.id),
    (select round(avg(j.total_score)::numeric,2) from judging_scores j where j.submission_id=s.id),
    x.rank_position, x.award_code, coalesce(x.is_published,false)
  from submissions s
  join registrations r on r.id=s.registration_id
  join participants p on p.id=r.participant_id
  left join judging_scores mine on mine.submission_id=s.id and mine.judge_id=auth.uid()
  left join results x on x.registration_id=r.id
  where s.status='approved' and r.payment_status='paid' and r.registration_status='verified'
    and (p_season is null or r.season_id=p_season)
  order by r.competition_type, r.category, s.submitted_at;
end$$;
revoke all on function public.admin_judging_queue(uuid) from public,anon;
grant execute on function public.admin_judging_queue(uuid) to authenticated;

-- 8. Leaderboard for the results, claim and shipping screens.
create or replace function public.admin_leaderboard(p_season uuid default null)
returns table(
  registration_id uuid, registration_code text, season_id uuid, competition_type text, category text,
  public_name text, full_name text, regency_name text, province_name text, whatsapp text,
  score numeric, judge_count bigint, rank_position integer, award_code text, award_source text,
  is_published boolean, published_at timestamptz, final_score numeric,
  claim_status text, invoice_number text, claim_paid_at timestamptz,
  shipping_status text, courier text, tracking_number text, shipped_at timestamptz
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
    h.shipping_status, h.courier, h.tracking_number, h.shipped_at
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

-- 9. Dashboard counters for the new stages.
create or replace function public.admin_dashboard(p_season uuid default null)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare output jsonb;
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then raise exception 'Unauthorized'; end if;
  with r as(select * from registrations where p_season is null or season_id=p_season)
  select jsonb_build_object(
    'total_registrasi',count(*),
    'review_pending',count(*) filter(where review_status='pending'),
    'review_approved',count(*) filter(where review_status='approved'),
    'review_rejected',count(*) filter(where review_status='rejected'),
    'pembayaran_pending',count(*) filter(where payment_status='pending'),
    'pembayaran_paid',count(*) filter(where payment_status='paid'),
    'fotogenik',count(*) filter(where competition_type='photogenic'),
    'mewarnai',count(*) filter(where competition_type='coloring'),
    'karya_pending',(select count(*) from submissions s join r on r.id=s.registration_id where s.status='pending_review'),
    'karya_approved',(select count(*) from submissions s join r on r.id=s.registration_id where s.status='approved'),
    'karya_dinilai',(select count(distinct s.id) from submissions s join r on r.id=s.registration_id join judging_scores j on j.submission_id=s.id),
    'juara',(select count(*) from results x join r on r.id=x.registration_id),
    'juara_diumumkan',(select count(*) from results x join r on r.id=x.registration_id where x.is_published),
    'klaim',(select count(*) from claim_invoices c join r on r.id=c.registration_id),
    'klaim_dibayar',(select count(*) from claim_invoices c join r on r.id=c.registration_id where c.status='paid'),
    'pengiriman',(select count(*) from shipments s join r on r.id=s.registration_id),
    'terkirim',(select count(*) from shipments s join r on r.id=s.registration_id where s.shipping_status in ('shipped','delivered')),
    'per_kategori',(select jsonb_object_agg(category,n) from(select category,count(*) n from r group by category) a),
    'per_provinsi',(select jsonb_object_agg(province_name,n) from(select p.province_name,count(*) n from r join participants p on p.id=r.participant_id group by p.province_name) a),
    'sumber_registrasi',(select jsonb_object_agg(registration_source,n) from(select registration_source,count(*) n from r group by registration_source) a)
  ) into output from r;
  return output;
end$$;
revoke all on function public.admin_dashboard(uuid) from public,anon;
grant execute on function public.admin_dashboard(uuid) to authenticated;

-- 10. Realtime for results, scores and seasons.
do $$declare t text;begin
  foreach t in array array['results','judging_scores','seasons'] loop
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename=t) then
      execute format('alter publication supabase_realtime add table %I',t);
    end if;
  end loop;
end$$;
