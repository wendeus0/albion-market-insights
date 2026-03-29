import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function parsePollIntervalMs(value: string | undefined): number {
  const parsed = Number(value ?? "30000");
  if (!Number.isFinite(parsed) || parsed <= 0) return 30000;
  return parsed;
}

export const config = {
  discord: {
    token: requireEnv("DISCORD_BOT_TOKEN"),
    clientId: requireEnv("DISCORD_CLIENT_ID"),
  },
  supabase: {
    url: requireEnv("SUPABASE_URL"),
    serviceKey: requireEnv("SUPABASE_SERVICE_KEY"),
  },
  appBaseUrl:
    process.env.APP_BASE_URL ?? "https://albion-market-insights.pages.dev",
  pollIntervalMs: parsePollIntervalMs(process.env.POLL_INTERVAL_MS),
};
