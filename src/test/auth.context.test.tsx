import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/useAuth";
import type { ReactNode } from "react";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

import { supabase } from "@/lib/supabase";

const mockUser = { id: "user-123", email: "test@test.com" };
const mockSession = { user: mockUser, access_token: "token" };

function makeSubscription() {
  return { data: { subscription: { unsubscribe: vi.fn() } } };
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.onAuthStateChange as Mock).mockReturnValue(
      makeSubscription(),
    );
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("deve inicializar com user null e loading true", async () => {
    let resolveFn!: () => void;
    (supabase.auth.getSession as Mock).mockReturnValue(
      new Promise((res) => {
        resolveFn = () => res({ data: { session: null }, error: null });
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    await act(async () => resolveFn());
  });

  it("deve resolver loading após getSession completar", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("deve atualizar user quando getSession retorna sessão", async () => {
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("deve atualizar user via onAuthStateChange SIGNED_IN", async () => {
    let authCallback!: (event: string, session: unknown) => void;
    (supabase.auth.onAuthStateChange as Mock).mockImplementation(
      (cb: typeof authCallback) => {
        authCallback = cb;
        return makeSubscription();
      },
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => authCallback("SIGNED_IN", mockSession));
    expect(result.current.user).toEqual(mockUser);
  });

  it("deve limpar user via onAuthStateChange SIGNED_OUT", async () => {
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    let authCallback!: (event: string, session: unknown) => void;
    (supabase.auth.onAuthStateChange as Mock).mockImplementation(
      (cb: typeof authCallback) => {
        authCallback = cb;
        return makeSubscription();
      },
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    act(() => authCallback("SIGNED_OUT", null));
    expect(result.current.user).toBeNull();
  });

  it("signInWithDiscord deve delegar para supabase.auth.signInWithOAuth", async () => {
    (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const error = await result.current.signInWithDiscord();
      expect(error).toBeNull();
    });
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "discord",
      options: expect.objectContaining({
        redirectTo: expect.stringContaining("/auth/callback"),
        scopes: "identify email",
      }),
    });
  });

  it("signInWithDiscord deve retornar AuthError quando OAuth falha", async () => {
    const authError = { message: "OAuth failed" };
    (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({
      error: authError,
    });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const error = await result.current.signInWithDiscord();
      expect(error).toEqual(authError);
    });
  });

  it("signOut deve chamar supabase.auth.signOut", async () => {
    (supabase.auth.signOut as Mock).mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("deve encerrar loading mesmo quando getSession falha", async () => {
    (supabase.auth.getSession as Mock).mockRejectedValue(
      new Error("network error"),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("useAuth fora do provider deve lançar erro descritivo", () => {
    expect(() => renderHook(() => useAuth())).toThrow();
  });
});
