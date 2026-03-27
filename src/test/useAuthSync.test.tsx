import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthSync } from '@/hooks/useAuthSync';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('@/services', () => ({
  marketService: {
    setStorage: vi.fn(),
    getAlerts: vi.fn().mockResolvedValue([]),
    saveAlert: vi.fn(),
    deleteAlert: vi.fn(),
  },
}));

vi.mock('@/services/alert.storage.supabase', () => ({
  SupabaseAlertStorageService: vi.fn().mockImplementation(function () {
    return {
      getAlerts: vi.fn().mockResolvedValue([]),
      saveAlert: vi.fn().mockResolvedValue(undefined),
      deleteAlert: vi.fn().mockResolvedValue(undefined),
    };
  }),
}));

vi.mock('@/services/alert.storage', () => ({
  AlertStorageService: vi.fn().mockImplementation(function () {
    return {
      getAlerts: vi.fn().mockReturnValue([]),
      saveAlert: vi.fn(),
      deleteAlert: vi.fn(),
    };
  }),
}));

import { supabase } from '@/lib/supabase';
import { marketService } from '@/services';

const mockUser = { id: 'user-123', email: 'test@test.com' };
const mockSession = { user: mockUser, access_token: 'token' };

function makeSubscription() {
  return { data: { subscription: { unsubscribe: vi.fn() } } };
}

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe('useAuthSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (supabase.auth.onAuthStateChange as Mock).mockReturnValue(makeSubscription());
    (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: null }, error: null });
  });

  it('não chama setStorage quando não há usuário logado', async () => {
    renderHook(() => useAuthSync(), { wrapper: makeWrapper() });
    await waitFor(() => {});
    expect(marketService.setStorage).not.toHaveBeenCalled();
  });

  it('chama setStorage com SupabaseAlertStorageService ao logar', async () => {
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    renderHook(() => useAuthSync(), { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(marketService.setStorage).toHaveBeenCalledTimes(1);
    });
  });

  it('chama setStorage com AlertStorageService ao deslogar', async () => {
    let authCallback!: (event: string, session: unknown) => void;
    (supabase.auth.onAuthStateChange as Mock).mockImplementation((cb: typeof authCallback) => {
      authCallback = cb;
      return makeSubscription();
    });
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    renderHook(() => useAuthSync(), { wrapper: makeWrapper() });
    await waitFor(() => expect(marketService.setStorage).toHaveBeenCalledTimes(1));

    act(() => authCallback('SIGNED_OUT', null));
    expect(marketService.setStorage).toHaveBeenCalledTimes(2);
  });

  it('não migra se localStorage de alertas estiver vazio', async () => {
    localStorage.setItem('albion_alerts', JSON.stringify([]));
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { SupabaseAlertStorageService } = await import('@/services/alert.storage.supabase');
    const mockSaveAlert = vi.fn().mockResolvedValue(undefined);
    (SupabaseAlertStorageService as Mock).mockImplementation(function () {
      return {
        getAlerts: vi.fn().mockResolvedValue([]),
        saveAlert: mockSaveAlert,
        deleteAlert: vi.fn().mockResolvedValue(undefined),
      };
    });

    renderHook(() => useAuthSync(), { wrapper: makeWrapper() });
    await waitFor(() => expect(marketService.setStorage).toHaveBeenCalled());
    expect(mockSaveAlert).not.toHaveBeenCalled();
  });

  it('não migra se flag de migração já existir', async () => {
    const alert = {
      id: 'a1',
      itemId: 'T4_BAG',
      itemName: 'Bag',
      quality: 'Normal',
      city: 'Caerleon',
      condition: 'below',
      threshold: 1000,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      notifications: { inApp: true, email: false },
    };
    localStorage.setItem('albion_alerts', JSON.stringify([alert]));
    localStorage.setItem('albion_alerts_migrated_user-123', '2026-01-01T00:00:00.000Z');

    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { SupabaseAlertStorageService } = await import('@/services/alert.storage.supabase');
    const mockSaveAlert = vi.fn().mockResolvedValue(undefined);
    (SupabaseAlertStorageService as Mock).mockImplementation(function () {
      return {
        getAlerts: vi.fn().mockResolvedValue([]),
        saveAlert: mockSaveAlert,
        deleteAlert: vi.fn().mockResolvedValue(undefined),
      };
    });

    renderHook(() => useAuthSync(), { wrapper: makeWrapper() });
    await waitFor(() => expect(marketService.setStorage).toHaveBeenCalled());
    expect(mockSaveAlert).not.toHaveBeenCalled();
  });
});
