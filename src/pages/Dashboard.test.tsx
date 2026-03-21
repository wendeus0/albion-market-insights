import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { toast } from "sonner";

// Mock dos hooks
vi.mock("@/hooks/useMarketItems", () => ({
  useMarketItems: vi.fn(),
}));

vi.mock("@/hooks/useLastUpdateTime", () => ({
  useLastUpdateTime: vi.fn(),
}));

vi.mock("@/hooks/useRefreshCooldown", () => ({
  useRefreshCooldown: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

import { useMarketItems } from "@/hooks/useMarketItems";
import { useLastUpdateTime } from "@/hooks/useLastUpdateTime";
import { useRefreshCooldown } from "@/hooks/useRefreshCooldown";

const mockUseMarketItems = vi.mocked(useMarketItems);
const mockUseLastUpdateTime = vi.mocked(useLastUpdateTime);
const mockUseRefreshCooldown = vi.mocked(useRefreshCooldown);

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUseMarketItems.mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof useMarketItems>);

    mockUseLastUpdateTime.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useLastUpdateTime>);

    mockUseRefreshCooldown.mockReturnValue({
      canRefresh: true,
      timeRemaining: 0,
      formattedTime: "04:59",
      recordRefresh: vi.fn(),
      refreshState: { canRefresh: true, timeRemaining: 0, lastRefresh: 0 },
    } as ReturnType<typeof useRefreshCooldown>);
  });

  it("deve renderizar titulo e descricao", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Market Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Real-time price data across all Albion Online cities"),
    ).toBeInTheDocument();
  });

  it("deve renderizar botao de refresh habilitado quando pode refresh", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole("button", { name: /refresh data/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
  });

  it("deve desabilitar botao de refresh quando em cooldown", () => {
    mockUseRefreshCooldown.mockReturnValue({
      canRefresh: false,
      timeRemaining: 299000, // 4:59
      formattedTime: "04:59",
      recordRefresh: vi.fn(),
      refreshState: {
        canRefresh: false,
        timeRemaining: 299000,
        lastRefresh: Date.now(),
      },
    } as ReturnType<typeof useRefreshCooldown>);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole("button", { name: /04:59/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
  });

  it("deve mostrar toast de sucesso ao fazer refresh", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole("button", { name: /refresh data/i });
    fireEvent.click(refreshButton);

    expect(toast.success).toHaveBeenCalledWith("Data refreshed", {
      description: "Market prices have been updated.",
    });
  });

  it("deve desabilitar refresh durante loading mesmo com cooldown liberado", () => {
    mockUseMarketItems.mockReturnValue({
      data: [],
      isLoading: true,
    } as ReturnType<typeof useMarketItems>);

    mockUseLastUpdateTime.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useLastUpdateTime>);

    mockUseRefreshCooldown.mockReturnValue({
      canRefresh: true,
      timeRemaining: 0,
      formattedTime: "05:00",
      recordRefresh: vi.fn(),
      refreshState: { canRefresh: true, timeRemaining: 0, lastRefresh: 0 },
    } as ReturnType<typeof useRefreshCooldown>);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole("button");
    expect(refreshButton).toBeDisabled();
  });

  it("deve exibir fallback para Last Update quando não há timestamp", () => {
    mockUseLastUpdateTime.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useLastUpdateTime>);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Last Update")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("deve mostrar skeleton enquanto carrega", () => {
    mockUseMarketItems.mockReturnValue({
      data: [],
      isLoading: true,
    } as ReturnType<typeof useMarketItems>);

    mockUseLastUpdateTime.mockReturnValue({
      data: null,
      isLoading: true,
    } as ReturnType<typeof useLastUpdateTime>);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole("button");
    expect(refreshButton).toBeDisabled();
  });

  it("deve renderizar stats cards", () => {
    mockUseMarketItems.mockReturnValue({
      data: [
        {
          itemId: "T4_SWORD",
          sellPrice: 1000,
          buyPrice: 900,
          city: "Caerleon",
          spread: 100,
          spreadPercent: 10,
        },
        {
          itemId: "T5_AXE",
          sellPrice: 2000,
          buyPrice: 1800,
          city: "Bridgewatch",
          spread: 200,
          spreadPercent: 11,
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useMarketItems>);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Total Items")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Cities")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("deve exibir hora da ultima atualizacao", () => {
    mockUseLastUpdateTime.mockReturnValue({
      data: "2026-03-20T12:00:00.000Z",
      isLoading: false,
    } as ReturnType<typeof useLastUpdateTime>);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Last Update")).toBeInTheDocument();
  });
});
