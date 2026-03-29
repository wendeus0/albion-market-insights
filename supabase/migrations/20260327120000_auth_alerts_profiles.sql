create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  discord_webhook_url text,
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.alerts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  item_name text not null,
  city text not null,
  condition text not null check (condition in ('below', 'above', 'change')),
  threshold numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  notifications jsonb not null default '{"inApp": true, "email": false}'::jsonb
);

create index if not exists alerts_user_id_created_at_idx
  on public.alerts (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.alerts enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "alerts_select_own" on public.alerts;
create policy "alerts_select_own"
  on public.alerts
  for select
  using (auth.uid() = user_id);

drop policy if exists "alerts_insert_own" on public.alerts;
create policy "alerts_insert_own"
  on public.alerts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "alerts_update_own" on public.alerts;
create policy "alerts_update_own"
  on public.alerts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "alerts_delete_own" on public.alerts;
create policy "alerts_delete_own"
  on public.alerts
  for delete
  using (auth.uid() = user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();
