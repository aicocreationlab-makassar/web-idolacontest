-- New codes are easier to read: IDC-{FIRST_NAME}-{8 RANDOM SAFE CHARACTERS}.
-- The legacy shape remains valid so existing participants keep access.
alter table public.registrations
  drop constraint if exists registration_code_shape;

alter table public.registrations
  add constraint registration_code_shape check (
    registration_code ~ '^IDC-([A-Z0-9]{1,12}-[A-F0-9]{24}|[A-Z0-9]{2,6}-[A-HJ-NP-Z2-9]{8})$'
  );
