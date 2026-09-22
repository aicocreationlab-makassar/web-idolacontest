-- Public activity only includes verified, paid registrations with publication consent.
create view public.public_recent_registrations with (security_barrier=true) as
select p.public_name,r.competition_type,r.created_at
from registrations r join participants p on p.id=r.participant_id
where r.payment_status='paid' and r.registration_status='verified' and r.consent_publication
order by r.created_at desc limit 10;
grant select on public.public_recent_registrations to anon,authenticated,service_role;

-- Hard deletion is restricted to authenticated admins and keeps an explicit audit record.
create function public.admin_delete_registration(p_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare r registrations; actor uuid:=auth.uid();
begin
  if admin_role() not in ('admin','super_admin') then raise exception 'Unauthorized'; end if;
  select * into r from registrations where id=p_id for update;
  if r.id is null then raise exception 'Missing registration'; end if;
  insert into admin_audit_logs(admin_user_id,action,entity_type,entity_id,before_data)
    values(actor,'HARD_DELETE','registrations',r.id,to_jsonb(r));
  delete from shipments where registration_id=r.id;
  delete from claim_invoices where registration_id=r.id;
  delete from payments where registration_id=r.id;
  delete from results where registration_id=r.id;
  delete from judging_scores where submission_id in(select id from submissions where registration_id=r.id);
  delete from worksheets where registration_id=r.id;
  delete from submissions where registration_id=r.id;
  delete from participant_media where registration_id=r.id;
  delete from registrations where id=r.id;
  delete from participants where id=r.participant_id and not exists(select 1 from registrations where participant_id=r.participant_id);
end$$;
revoke all on function public.admin_delete_registration(uuid) from public,anon;
grant execute on function public.admin_delete_registration(uuid) to authenticated;

create function public.admin_purge_season_media(p_season uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  if admin_role()<>'super_admin' then raise exception 'Super admin required'; end if;
  insert into admin_audit_logs(admin_user_id,action,entity_type,entity_id,before_data)
    values(auth.uid(),'PURGE_SEASON_MEDIA','seasons',p_season,jsonb_build_object('season_id',p_season));
  delete from judging_scores where submission_id in(select s.id from submissions s join registrations r on r.id=s.registration_id where r.season_id=p_season);
  delete from worksheets where registration_id in(select id from registrations where season_id=p_season);
  delete from submissions where registration_id in(select id from registrations where season_id=p_season);
  delete from participant_media where registration_id in(select id from registrations where season_id=p_season);
end$$;
revoke all on function public.admin_purge_season_media(uuid) from public,anon;
grant execute on function public.admin_purge_season_media(uuid) to authenticated;
