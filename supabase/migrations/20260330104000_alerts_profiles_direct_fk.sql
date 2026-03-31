insert into public.profiles (id)
select u.id
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

create or replace function public.ensure_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function public.ensure_profile_for_auth_user();

alter table public.alerts
  drop constraint if exists alerts_user_id_profiles_fkey;

alter table public.alerts
  add constraint alerts_user_id_profiles_fkey
  foreign key (user_id)
  references public.profiles (id)
  on delete cascade;
