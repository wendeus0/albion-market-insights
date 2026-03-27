import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockUser = { id: 'user-123', email: 'test@test.com' };

vi.mock('@/lib/supabase', () => ({
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

vi.mock('@/contexts/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: { id: 'user-123', email: 'test@test.com' }, loading: false }),
}));

import { supabase } from '@/lib/supabase';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna null quando não há usuário', async () => {
    const { useAuth } = await import('@/contexts/useAuth');
    (useAuth as Mock).mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useProfile(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile).toBeNull();

    (useAuth as Mock).mockReturnValue({ user: mockUser, loading: false });
  });

  it('retorna perfil do usuário quando logado', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'user-123',
          discord_webhook_url: 'https://discord.com/webhook',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useProfile(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toEqual({
      id: 'user-123',
      discordWebhookUrl: 'https://discord.com/webhook',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('retorna perfil com discordWebhookUrl null quando campo é null', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'user-123',
          discord_webhook_url: null,
          updated_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useProfile(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile?.discordWebhookUrl).toBeNull();
  });
});

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('faz upsert na tabela profiles ao atualizar', async () => {
    const mockFrom = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
        discordWebhookUrl: 'https://discord.com/new-webhook',
      });
    });

    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockFrom.upsert).toHaveBeenCalledWith({
      id: 'user-123',
      discord_webhook_url: 'https://discord.com/new-webhook',
      updated_at: expect.any(String),
    });
  });

  it('propaga erro do Supabase', async () => {
    const mockFrom = {
      upsert: vi.fn().mockResolvedValue({ error: { message: 'DB error' } }),
    };
    (supabase.from as Mock).mockReturnValue(mockFrom);

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: makeWrapper() });

    await expect(
      act(async () => {
        await result.current.mutateAsync({ discordWebhookUrl: null });
      }),
    ).rejects.toThrow('DB error');
  });
});
