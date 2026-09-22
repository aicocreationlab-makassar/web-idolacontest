-- Run after creating admin@idolacontest.my.ud in Authentication > Users.
-- Passwords belong in Supabase Auth and must never be stored in SQL migrations.
insert into public.admin_profiles(user_id,display_name,role)
select id,'Administrator Idola Contest','super_admin'
from auth.users where email='admin@idolacontest.my.ud'
on conflict(user_id) do update set display_name=excluded.display_name,role=excluded.role;
