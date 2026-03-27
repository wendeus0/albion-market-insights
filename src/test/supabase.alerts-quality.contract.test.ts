import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260327_alerts_add_quality.sql',
);

describe('supabase alerts quality contract', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  it('versiona migracao incremental para quality em alerts', () => {
    expect(sql).toContain('alter table public.alerts');
    expect(sql).toContain('add column if not exists quality text;');
    expect(sql).toContain("set quality = 'Normal'");
    expect(sql).toContain("alter column quality set default 'Normal';");
    expect(sql).toContain('alter column quality set not null;');
  });
});
