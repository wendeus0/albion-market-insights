import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
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
import { useProfile } from "@/hooks/useProfile";

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useProfile — discord-web-linking RED", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      user: discordUser,
      loading: false,
    });
  });

  it("should sync discord identity into profiles when authenticated discord session has stable metadata and stored profile is not linked", async () => {
    // RED: falha até discord-web-linking ser implementada
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

    expect(selectChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-discord-1",
        discord_id: "718633605345050734",
        discord_username: "wendeus__#0",
        discord_dm_enabled: true,
      }),
    );
    expect(result.current.profile?.discordId).toBe("718633605345050734");
  });

  it("should enable discord dm immediately when web linking sync succeeds", async () => {
    // RED: falha até discord-web-linking ser implementada
    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "user-discord-1",
          discord_id: null,
          discord_username: null,
          discord_dm_enabled: false,
          discord_webhook_url: "https://discord.com/api/webhooks/existing",
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

    expect(selectChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        discord_dm_enabled: true,
      }),
    );
    expect(result.current.profile?.discordDmEnabled).toBe(true);
  });

  it("should expose a controlled sync error when persisting web link fails after discord login", async () => {
    // RED: falha até discord-web-linking ser implementada
    let calls = 0;
    (supabase.from as Mock).mockImplementation(() => {
      calls += 1;

      if (calls === 1) {
        return {
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
        };
      }

      return {
        upsert: vi.fn().mockResolvedValue({
          error: { message: "sync failed" },
        }),
      };
    });

    const { result } = renderHook(() => useProfile(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error?.message).toBe("sync failed");
    expect(result.current.profile).toBeNull();
  });
});
