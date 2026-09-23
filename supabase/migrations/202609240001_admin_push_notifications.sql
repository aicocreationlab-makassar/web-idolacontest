-- Private Web Push subscriptions used only for authenticated admin alerts.
create table if not exists public.admin_push_subscriptions(
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_profiles(user_id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_push_subscriptions_admin
  on public.admin_push_subscriptions(admin_user_id);

alter table public.admin_push_subscriptions enable row level security;
revoke all on public.admin_push_subscriptions from public, anon, authenticated;
grant select, insert, update, delete on public.admin_push_subscriptions to service_role;

