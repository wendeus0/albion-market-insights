import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260329_discord_oauth_bot.sql",
);
const uniqueMigrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260329103000_discord_oauth_bot_unique_indexes.sql",
);

describe("supabase discord contract", () => {
  const sql = readFileSync(migrationPath, "utf8");
  const uniqueSql = readFileSync(uniqueMigrationPath, "utf8");

  it("versiona colunas de perfil para OAuth e link magico", () => {
    expect(sql).toContain("add column if not exists discord_id text");
    expect(sql).toContain("add column if not exists discord_username text");
    expect(sql).toContain("add column if not exists discord_locale text");
    expect(sql).toContain(
      "add column if not exists discord_dm_enabled boolean not null default false",
    );
    expect(sql).toContain("add column if not exists discord_link_token text");
    expect(sql).toContain(
      "add column if not exists discord_link_expires_at timestamptz",
    );
  });

  it("versiona colunas de alerta para notificacao Discord", () => {
    expect(sql).toContain("add column if not exists fired_at timestamptz");
    expect(sql).toContain(
      "add column if not exists notified_discord boolean not null default false",
    );
    expect(sql).toContain("add column if not exists notified_at timestamptz");
  });

  it("garante unicidade para discord_id e discord_link_token", () => {
    expect(sql).toContain(
      "create unique index if not exists profiles_discord_id_idx",
    );
    expect(sql).toContain(
      "create unique index if not exists profiles_discord_link_token_idx",
    );
    expect(uniqueSql).toContain(
      "drop index if exists public.profiles_discord_id_idx",
    );
    expect(uniqueSql).toContain(
      "drop index if exists public.profiles_discord_link_token_idx",
    );
  });
});
