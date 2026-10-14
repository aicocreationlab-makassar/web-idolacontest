-- Photogenic entries come from the registration photo, and payment verification
-- is a single admin step (approve + paid) instead of two separate decisions.

-- 1. Where a submission came from: uploaded via Cek Status or copied from the
--    registration photo of a photogenic participant.
alter table public.submissions
  add column if not exists source text not null default 'upload';
alter table public.submissions
  drop constraint if exists submissions_source_check;
alter table public.submissions
  add constraint submissions_source_check
  check (source in ('upload','registration_photo'));

-- 2. Turn the registration photo (already copied to submission-private by the
--    app) into the approved photogenic entry. Returns false when the
--    participant already has a current entry. No deadline check: the photo was
--    sent with the registration.
create or replace function public.admin_create_photo_entry(
  p_registration uuid,
  p_path text
) returns boolean language plpgsql security definer set search_path=public as $$
declare r registrations;
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then
    raise exception 'Unauthorized';
  end if;
  if coalesce(trim(p_path),'')='' then raise exception 'Missing path'; end if;
  select * into r from registrations where id=p_registration for update;
  if r.id is null then raise exception 'Missing registration'; end if;
  if r.competition_type<>'photogenic' then raise exception 'Not eligible'; end if;
  if r.registration_status<>'verified' then raise exception 'Not verified'; end if;
  if exists(
    select 1 from submissions
    where registration_id=r.id and status in ('pending_review','approved')
  ) then
    return false;
  end if;
  insert into submissions(
    registration_id,submission_type,private_file_path,status,source,
    submitted_at,reviewed_at,reviewed_by
  ) values (
    r.id,'photogenic',p_path,'approved','registration_photo',
    r.created_at,now(),auth.uid()
  );
  return true;
end$$;
revoke all on function public.admin_create_photo_entry(uuid,text) from public,anon;
grant execute on function public.admin_create_photo_entry(uuid,text) to authenticated;

-- 3. One decision for payment verification:
--    approve = registration approved + registration payment paid (-> verified)
--    reject  = registration rejected (a pending payment becomes rejected)
--    pending = back to waiting for verification
create or replace function public.admin_verify_registration(
  p_id uuid,
  p_decision text,
  p_note text default null
) returns void language plpgsql security definer set search_path=public as $$
declare r registrations; note text; payment text;
begin
  if admin_role() not in ('admin','super_admin') or admin_role() is null then
    raise exception 'Unauthorized';
  end if;
  if p_decision not in ('approve','reject','pending') then
    raise exception 'Invalid decision';
  end if;
  if length(coalesce(p_note,'')) > 500 then
    raise exception 'Review note is too long';
  end if;
  select * into r from registrations where id=p_id for update;
  if r.id is null then raise exception 'Missing registration'; end if;
  note:=nullif(trim(coalesce(p_note,'')),'');
  payment:=case
    when p_decision='approve' then 'paid'
    when p_decision='pending' then 'pending'
    when r.payment_status='pending' then 'rejected'
    else r.payment_status
  end;
  if payment<>'paid' and exists(
    select 1 from submissions where registration_id=r.id and publication_status='approved'
  ) then
    raise exception 'Unpublish first';
  end if;
  if payment<>r.payment_status then
    update payments
    set status=payment,
        verified_by=case when payment='pending' then null else auth.uid() end,
        verified_at=case when payment='pending' then null else now() end,
        admin_note=coalesce(note,admin_note),
        updated_at=now()
    where registration_id=r.id and payment_type='registration';
  end if;
  update registrations
  set review_status=case p_decision
        when 'approve' then 'approved'
        when 'reject' then 'rejected'
        else 'pending'
      end,
      reviewed_at=case when p_decision='pending' then null else now() end,
      reviewed_by=case when p_decision='pending' then null else auth.uid() end,
      review_note=note,
      payment_status=payment,
      updated_at=now()
  where id=r.id;
end$$;
revoke all on function public.admin_verify_registration(uuid,text,text) from public,anon;
grant execute on function public.admin_verify_registration(uuid,text,text) to authenticated;
