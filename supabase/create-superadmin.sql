-- ONE-TIME BOOTSTRAP — jalankan melalui Supabase SQL Editor.
-- Login email : admin@idolacontest.my.ud
-- Password    : riswan0110
--
-- Hapus file ini dari source control atau ganti password setelah dijalankan.
-- Untuk produksi berikutnya, gunakan scripts/create-admin.mjs / Admin Auth API.

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_email constant text := 'admin@idolacontest.my.ud';
  v_password constant text := 'riswan0110';
  v_user_id uuid;
begin
  select id
    into v_user_id
    from auth.users
   where lower(email) = lower(v_email)
   limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      extensions.crypt(v_password, extensions.gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('display_name', 'Administrator Idola Contest'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(
             v_password,
             extensions.gen_salt('bf')
           ),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_app_meta_data = jsonb_build_object(
             'provider', 'email',
             'providers', array['email']
           ),
           updated_at = now()
     where id = v_user_id;
  end if;

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  where not exists (
    select 1
      from auth.identities
     where user_id = v_user_id
       and provider = 'email'
  );

  insert into public.admin_profiles (
    user_id,
    display_name,
    role
  ) values (
    v_user_id,
    'Administrator Idola Contest',
    'super_admin'
  )
  on conflict (user_id) do update
    set display_name = excluded.display_name,
        role = excluded.role;

  raise notice 'Superadmin % berhasil dibuat/diperbarui.', v_email;
end
$$;

-- Verifikasi tanpa menampilkan hash password:
select
  u.id,
  u.email,
  u.email_confirmed_at,
  p.display_name,
  p.role
from auth.users u
join public.admin_profiles p on p.user_id = u.id
where lower(u.email) = lower('admin@idolacontest.my.ud');
