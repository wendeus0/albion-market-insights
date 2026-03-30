import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";

function AlertsPlaceholder() {
  return <div>Alerts Page</div>;
}

function makeWrapper(
  initialEntries?: Parameters<typeof MemoryRouter>[0]["initialEntries"],
) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={initialEntries}>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function makeSubscription() {
  return { data: { subscription: { unsubscribe: vi.fn() } } };
}

describe("Login", () => {
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

  it("renderiza CTA de login com Discord", async () => {
    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /entrar/i }),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByRole("button", { name: /entrar com discord/i }),
    ).toBeInTheDocument();
  });

  it("inicia OAuth com Discord ao clicar no CTA", async () => {
    (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({
      data: { provider: "discord" },
      error: null,
    });

    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /entrar com discord/i }),
      ).toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /entrar com discord/i }),
    );

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "discord",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("/auth/callback"),
          scopes: "identify email",
        }),
      });
    });
  });

  it("exibe erro amigavel quando OAuth falha", async () => {
    (supabase.auth.signInWithOAuth as Mock).mockResolvedValue({
      data: { provider: "discord" },
      error: { message: "OAuth failed" },
    });

    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /entrar com discord/i }),
      ).toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /entrar com discord/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/oauth failed/i)).toBeInTheDocument();
    });
  });

  it("mostra erro vindo do callback quando location state estiver preenchido", async () => {
    const Wrapper = makeWrapper([
      {
        pathname: "/login",
        state: { error: "Login cancelado. Tente novamente." },
      },
    ]);
    render(<Login />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /entrar com discord/i }),
      ).toBeInTheDocument(),
    );

    expect(
      screen.getByText(/login cancelado\. tente novamente\./i),
    ).toBeInTheDocument();
  });

  it("mostra loading state durante request OAuth", async () => {
    let resolveSignIn!: (v: unknown) => void;
    (supabase.auth.signInWithOAuth as Mock).mockReturnValue(
      new Promise((r) => {
        resolveSignIn = r;
      }),
    );

    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /entrar com discord/i }),
      ).toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: /entrar com discord/i }),
    );

    expect(
      screen.getByRole("button", { name: /conectando com discord/i }),
    ).toBeDisabled();

    await act(async () => {
      resolveSignIn({ data: { provider: "discord" }, error: null });
    });
  });

  it("redireciona usuario ja autenticado para /alerts", async () => {
    const mockUser = { id: "user-123", email: "test@test.com" };
    const mockSession = { user: mockUser, access_token: "token" };
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    function wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={qc}>
          <MemoryRouter initialEntries={["/login"]}>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/alerts" element={<AlertsPlaceholder />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );
    }

    render(<Login />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Alerts Page")).toBeInTheDocument();
    });
  });
});
