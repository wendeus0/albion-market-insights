import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260327_auth_alerts_profiles.sql',
);

describe('supabase rls contract', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  it('versiona schema minimo de profiles', () => {
    expect(sql).toContain('create table if not exists public.profiles');
    expect(sql).toContain('id uuid primary key references auth.users (id) on delete cascade');
    expect(sql).toContain('discord_webhook_url text');
    expect(sql).toContain('updated_at timestamptz not null');
  });

  it('versiona trigger para atualizar updated_at em profiles', () => {
    expect(sql).toContain('create or replace function public.set_updated_at()');
    expect(sql).toContain('create trigger profiles_set_updated_at');
    expect(sql).toContain('before update on public.profiles');
    expect(sql).toContain('execute function public.set_updated_at();');
  });

  it('versiona schema minimo de alerts', () => {
    expect(sql).toContain('create table if not exists public.alerts');
    expect(sql).toContain('user_id uuid not null references auth.users (id) on delete cascade');
    expect(sql).toContain('item_id text not null');
    expect(sql).toContain('notifications jsonb not null');
  });

  it('habilita RLS em profiles e alerts', () => {
    expect(sql).toContain('alter table public.profiles enable row level security;');
    expect(sql).toContain('alter table public.alerts enable row level security;');
  });

  it('define policies de acesso proprio em profiles', () => {
    expect(sql).toContain('create policy "profiles_select_own"');
    expect(sql).toContain('create policy "profiles_insert_own"');
    expect(sql).toContain('create policy "profiles_update_own"');
    expect(sql).toContain('using (auth.uid() = id)');
    expect(sql).toContain('with check (auth.uid() = id)');
  });

  it('define policies de acesso proprio em alerts', () => {
    expect(sql).toContain('create policy "alerts_select_own"');
    expect(sql).toContain('create policy "alerts_insert_own"');
    expect(sql).toContain('create policy "alerts_update_own"');
    expect(sql).toContain('create policy "alerts_delete_own"');
    expect(sql).toContain('using (auth.uid() = user_id)');
    expect(sql).toContain('with check (auth.uid() = user_id)');
  });
});
