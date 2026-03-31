import type { User } from "@supabase/supabase-js";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export interface DiscordSessionIdentity {
  isDiscordProvider: boolean;
  discordId: string | null;
  username: string | null;
}

export function getDiscordSessionIdentity(
  user: User | null | undefined,
): DiscordSessionIdentity {
  if (!user) {
    return { isDiscordProvider: false, discordId: null, username: null };
  }

  const appMetadata = asRecord(user.app_metadata);
  const userMetadata = asRecord(user.user_metadata);
  const customClaims = asRecord(userMetadata.custom_claims);

  const provider = asString(appMetadata.provider);
  const providers = Array.isArray(appMetadata.providers)
    ? appMetadata.providers.filter((value): value is string => typeof value === "string")
    : [];

  const isDiscordProvider =
    provider === "discord" || providers.includes("discord");

  if (!isDiscordProvider) {
    return { isDiscordProvider: false, discordId: null, username: null };
  }

  const discordId =
    asString(userMetadata.provider_id) ?? asString(userMetadata.sub);

  const username =
    asString(userMetadata.name) ??
    asString(userMetadata.full_name) ??
    asString(customClaims.global_name);

  return {
    isDiscordProvider: true,
    discordId,
    username,
  };
}
