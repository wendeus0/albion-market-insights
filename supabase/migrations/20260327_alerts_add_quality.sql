alter table public.alerts
add column if not exists quality text;

update public.alerts
set quality = 'Normal'
where quality is null;

alter table public.alerts
alter column quality set default 'Normal';

alter table public.alerts
alter column quality set not null;
