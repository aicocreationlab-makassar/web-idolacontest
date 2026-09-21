alter table seasons add constraint valid_dates check(registration_open_at<registration_close_at and registration_close_at<=submission_global_close_at and submission_global_close_at<judging_at and judging_at<announcement_at and announcement_at<shipping_at);
alter table seasons add constraint valid_slug check(slug ~ '^[A-Z0-9]{1,12}$');
alter table participants add constraint bounded_participant_fields check(length(full_name)<=120 and length(public_name)<=120 and length(parent_name)<=120 and length(address_line)<=300 and length(whatsapp)<=20);
alter table registrations add constraint registration_code_shape check(registration_code ~ '^IDC-[A-Z0-9]{1,12}-[A-F0-9]{24}$');
alter table submissions add constraint bounded_review_note check(length(review_note)<=500);
alter table payments add constraint correct_payment_amount check((payment_type='registration' and amount=20000) or (payment_type='award_claim' and amount=120000));
alter table shipments add constraint shipment_fields check(length(courier) between 1 and 60 and length(tracking_number)<=100 and (shipping_status not in ('shipped','delivered') or length(tracking_number)>0));
create function public.touch_updated_at() returns trigger language plpgsql set search_path=public as $$begin new.updated_at=now();return new;end$$;
do $$declare t text;begin foreach t in array array['seasons','participants','registrations','submissions','judging_scores','results','payments','shipments','event_settings'] loop execute format('create trigger touch_updated_at before update on %I for each row execute function touch_updated_at()',t);end loop;end$$;
