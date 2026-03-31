import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const discordUser = {
  id: "user-discord-1",
  email: "discord@example.com",
  app_metadata: { provider: "discord", providers: ["discord"] },
  user_metadata: {
    provider_id: "718633605345050734",
    sub: "718633605345050734",
    full_name: "wendeus__",
    name: "wendeus__#0",
  },
};

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("@/contexts/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/useAuth";
import { useProfile, useSyncDiscordProfile } from "@/hooks/useProfile";

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useProfile / useSyncDiscordProfile — discord-web-linking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      user: discordUser,
      loading: false,
    });
  });

  it("should read an unlinked profile without performing writes in queryFn", async () => {
    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "user-discord-1",
          discord_id: null,
          discord_username: null,
          discord_dm_enabled: false,
          discord_webhook_url: null,
          updated_at: "2026-03-30T00:00:00.000Z",
        },
        error: null,
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    (supabase.from as Mock).mockReturnValue(selectChain);

    const { result } = renderHook(() => useProfile(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(selectChain.upsert).not.toHaveBeenCalled();
    expect(result.current.profile?.discordId).toBeNull();
  });

  it("should enable discord dm immediately when explicit web linking sync succeeds", async () => {
    const upsertChain = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    (supabase.from as Mock).mockReturnValue(upsertChain);

    const { result } = renderHook(() => useSyncDiscordProfile(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        discordId: "718633605345050734",
        username: "wendeus__#0",
        discordWebhookUrl: "https://discord.com/api/webhooks/existing",
      });
    });

    expect(upsertChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        discord_dm_enabled: true,
      }),
    );
  });

  it("should expose a controlled sync error when persisting web link fails after discord login", async () => {
    const upsertChain = {
      upsert: vi.fn().mockResolvedValue({
        error: { message: "sync failed" },
      }),
    };

    (supabase.from as Mock).mockReturnValue(upsertChain);

    const { result } = renderHook(() => useSyncDiscordProfile(), {
      wrapper: makeWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          discordId: "718633605345050734",
          username: "wendeus__#0",
          discordWebhookUrl: null,
        });
      }),
    ).rejects.toThrow("sync failed");
  });
});
