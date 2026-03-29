drop index if exists public.profiles_discord_id_idx;

create unique index if not exists profiles_discord_id_idx
  on public.profiles (discord_id)
  where discord_id is not null;

drop index if exists public.profiles_discord_link_token_idx;

create unique index if not exists profiles_discord_link_token_idx
  on public.profiles (discord_link_token)
  where discord_link_token is not null;
