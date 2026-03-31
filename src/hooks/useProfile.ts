import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/useAuth";
import { getDiscordSessionIdentity } from "@/lib/discordAuth";
import type { UserProfile } from "@/data/types";

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, discord_id, discord_username, discord_dm_enabled, discord_webhook_url, updated_at",
    )
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    id: data.id as string,
    discordId: (data.discord_id as string | null | undefined) ?? null,
    discordUsername:
      (data.discord_username as string | null | undefined) ?? null,
    discordDmEnabled:
      (data.discord_dm_enabled as boolean | null | undefined) ?? false,
    discordWebhookUrl: data.discord_webhook_url as string | null,
    updatedAt: data.updated_at as string,
  };
}

async function syncDiscordProfile(
  userId: string,
  profile: UserProfile,
  discordId: string,
  username: string | null,
): Promise<UserProfile> {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    discord_id: discordId,
    discord_username: username,
    discord_dm_enabled: true,
    discord_webhook_url: profile.discordWebhookUrl,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  return {
    ...profile,
    discordId,
    discordUsername: username,
    discordDmEnabled: true,
    updatedAt: new Date().toISOString(),
  };
}

export function useProfile() {
  const { user } = useAuth();

  const {
    data: profile = null,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const currentProfile = await fetchProfile(user!.id);

      if (!currentProfile) return null;

      const identity = getDiscordSessionIdentity(user);
      const discordId = identity.discordId;
      const shouldSyncDiscordProfile =
        identity.isDiscordProvider && !currentProfile.discordId && !!discordId;

      if (!shouldSyncDiscordProfile || !discordId) {
        return currentProfile;
      }

      return syncDiscordProfile(
        user!.id,
        currentProfile,
        discordId,
        identity.username,
      );
    },
    enabled: !!user,
  });

  return { profile, isLoading, error, isError };
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: { discordWebhookUrl: string | null }) => {
      const { error } = await supabase.from("profiles").upsert({
        id: user!.id,
        discord_webhook_url: values.discordWebhookUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}
