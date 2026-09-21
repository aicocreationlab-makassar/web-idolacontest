grant usage on schema public to anon,authenticated,service_role;
grant select,insert,update,delete on seasons,participants,registrations,participant_media,submissions,worksheets,judging_scores,results,payments,claim_invoices,shipments,admin_profiles,admin_audit_logs,event_settings,rate_limits to service_role;
grant select on public_gallery,public_results to service_role;
