alter table public.registrations
  add column if not exists review_status text not null default 'pending',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists review_note text;

update public.registrations
set review_status = case
  when registration_status = 'verified' then 'approved'
  when registration_status = 'cancelled' then 'rejected'
  else 'pending'
end;

alter table public.registrations
  drop constraint if exists registrations_review_status_check;
alter table public.registrations
  add constraint registrations_review_status_check
  check (review_status in ('pending','approved','rejected'));
alter table public.registrations
  add constraint bounded_registration_review_note
  check (review_note is null or length(review_note) <= 500);

create or replace function public.sync_registration_access() returns trigger
language plpgsql set search_path=public as $$
begin
  if new.review_status = 'rejected' then
    new.registration_status := 'cancelled';
  elsif new.review_status = 'approved' and new.payment_status = 'paid' then
    new.registration_status := 'verified';
  else
    new.registration_status := 'registered';
  end if;
  return new;
end$$;

drop trigger if exists sync_registration_access on public.registrations;
create trigger sync_registration_access
before insert or update of review_status,payment_status on public.registrations
for each row execute function public.sync_registration_access();

create or replace function public.admin_review_registration(
  p_id uuid,
  p_status text,
  p_note text default null
) returns void language plpgsql security definer set search_path=public as $$
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then
    raise exception 'Unauthorized';
  end if;
  if p_status not in ('pending','approved','rejected') then
    raise exception 'Invalid review status';
  end if;
  if length(coalesce(p_note,'')) > 500 then
    raise exception 'Review note is too long';
  end if;
  update registrations
  set review_status=p_status,
      reviewed_at=case when p_status='pending' then null else now() end,
      reviewed_by=case when p_status='pending' then null else auth.uid() end,
      review_note=nullif(trim(coalesce(p_note,'')),''),
      updated_at=now()
  where id=p_id;
  if not found then raise exception 'Missing registration'; end if;
end$$;
revoke all on function public.admin_review_registration(uuid,text,text) from public,anon;
grant execute on function public.admin_review_registration(uuid,text,text) to authenticated;

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
    'klaim',(select count(*) from claim_invoices c join r on r.id=c.registration_id),
    'pengiriman',(select count(*) from shipments s join r on r.id=s.registration_id),
    'per_kategori',(select jsonb_object_agg(category,n) from(select category,count(*) n from r group by category) a),
    'per_provinsi',(select jsonb_object_agg(province_name,n) from(select p.province_name,count(*) n from r join participants p on p.id=r.participant_id group by p.province_name) a),
    'sumber_registrasi',(select jsonb_object_agg(registration_source,n) from(select registration_source,count(*) n from r group by registration_source) a)
  ) into output from r;
  return output;
end$$;
revoke all on function public.admin_dashboard(uuid) from public,anon;
grant execute on function public.admin_dashboard(uuid) to authenticated;
