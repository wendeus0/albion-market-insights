alter table public.alerts
add column if not exists quality text not null default 'Normal';
