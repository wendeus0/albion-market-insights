alter table public.profiles
add column if not exists discord_id text,
add column if not exists discord_username text,
add column if not exists discord_locale text,
add column if not exists discord_dm_enabled boolean not null default false,
add column if not exists discord_link_token text,
add column if not exists discord_link_expires_at timestamptz;

create unique index if not exists profiles_discord_id_idx
  on public.profiles (discord_id)
  where discord_id is not null;

create unique index if not exists profiles_discord_link_token_idx
  on public.profiles (discord_link_token)
  where discord_link_token is not null;

alter table public.alerts
add column if not exists fired_at timestamptz,
add column if not exists notified_discord boolean not null default false,
add column if not exists notified_at timestamptz;

create index if not exists alerts_fired_discord_idx
  on public.alerts (fired_at, notified_discord)
  where fired_at is not null;
