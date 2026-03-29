import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: vi.fn(),
    },
  },
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: vi.fn() };
});

import { supabase } from "@/lib/supabase";
import AuthCallback from "@/pages/AuthCallback";
import { useNavigate } from "react-router-dom";

describe("AuthCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("troca o code por sessao e redireciona para /alerts", async () => {
    const navigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(navigate);
    (supabase.auth.exchangeCodeForSession as Mock).mockResolvedValue({
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/auth/callback?code=oauth-code"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
        "oauth-code",
      );
      expect(navigate).toHaveBeenCalledWith("/alerts", { replace: true });
    });
  });

  it("redireciona para /login com erro quando o code nao existe", async () => {
    const navigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(navigate);

    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/login", {
        replace: true,
        state: { error: "Login cancelado. Tente novamente." },
      });
    });
  });

  it("redireciona com erro de conclusao quando a troca de sessao falha", async () => {
    const navigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(navigate);
    (supabase.auth.exchangeCodeForSession as Mock).mockResolvedValue({
      error: { message: "exchange failed" },
    });

    render(
      <MemoryRouter initialEntries={["/auth/callback?code=oauth-code"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/login", {
        replace: true,
        state: { error: "Nao foi possivel concluir o login. Tente novamente." },
      });
    });
  });
});
