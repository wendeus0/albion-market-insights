import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockUser = { id: "user-123", email: "test@test.com" };

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/contexts/useAuth", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: "user-123", email: "test@test.com" },
    loading: false,
  }),
}));

import { supabase } from "@/lib/supabase";
import {
  useProfile,
  useSyncDiscordProfile,
  useUpdateProfile,
} from "@/hooks/useProfile";
import { useAuth } from "@/contexts/useAuth";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ user: mockUser, loading: false });
  });

  it("retorna null quando não há usuário", async () => {
    (useAuth as Mock).mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useProfile(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile).toBeNull();
  });

  it("retorna perfil do usuário quando logado", async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "user-123",
          discord_id: "discord-user-1",
          discord_username: "AlbionUser",
          discord_dm_enabled: true,
          discord_webhook_url: "https://discord.com/webhook",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
        error: null,
      }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useProfile(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toEqual({
      id: "user-123",
      discordId: "discord-user-1",
      discordUsername: "AlbionUser",
      discordDmEnabled: true,
      discordWebhookUrl: "https://discord.com/webhook",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("retorna perfil com discordWebhookUrl null quando campo é null", async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "user-123",
          discord_id: null,
          discord_username: null,
          discord_dm_enabled: false,
          discord_webhook_url: null,
          updated_at: "2026-01-01T00:00:00.000Z",
        },
        error: null,
      }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useProfile(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile?.discordWebhookUrl).toBeNull();
    expect(result.current.profile?.discordId).toBeNull();
    expect(result.current.profile?.discordDmEnabled).toBe(false);
  });

  it("retorna null quando o Supabase informa ausencia de linha", async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "No rows found" },
      }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useProfile(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toBeNull();
  });

  it("expõe erro quando o Supabase falha por motivo diferente de ausencia de linha", async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "42501", message: "RLS denied" },
      }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useProfile(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toBeNull();
    expect(result.current.error?.message).toBe("RLS denied");
  });
});

describe("useSyncDiscordProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("faz upsert na tabela profiles ao sincronizar conta Discord", async () => {
    const mockFrom = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useSyncDiscordProfile(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        discordId: "discord-user-1",
        username: "AlbionUser",
        discordWebhookUrl: "https://discord.com/new-webhook",
      });
    });

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(mockFrom.upsert).toHaveBeenCalledWith({
      id: "user-123",
      discord_id: "discord-user-1",
      discord_username: "AlbionUser",
      discord_dm_enabled: true,
      discord_webhook_url: "https://discord.com/new-webhook",
      updated_at: expect.any(String),
    });
  });

  it("propaga erro do Supabase ao sincronizar conta Discord", async () => {
    const mockFrom = {
      upsert: vi.fn().mockResolvedValue({ error: { message: "Sync error" } }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useSyncDiscordProfile(), {
      wrapper: makeWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          discordId: "discord-user-1",
          username: "AlbionUser",
          discordWebhookUrl: null,
        });
      }),
    ).rejects.toThrow("Sync error");
  });
});

describe("useUpdateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("faz upsert na tabela profiles ao atualizar", async () => {
    const mockFrom = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        discordWebhookUrl: "https://discord.com/new-webhook",
      });
    });

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(mockFrom.upsert).toHaveBeenCalledWith({
      id: "user-123",
      discord_webhook_url: "https://discord.com/new-webhook",
      updated_at: expect.any(String),
    });
  });

  it("propaga erro do Supabase", async () => {
    const mockFrom = {
      upsert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: makeWrapper(),
    });

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          discordWebhookUrl: null,
        });
      }),
    ).rejects.toThrow("DB error");
  });
});
