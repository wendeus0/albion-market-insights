import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";

// Mock dos hooks
vi.mock("@/hooks/useMarketItems", () => ({
  useMarketItems: vi.fn(),
}));

vi.mock("@/hooks/useLastUpdateTime", () => ({
  useLastUpdateTime: vi.fn(),
}));



import { useMarketItems } from "@/hooks/useMarketItems";
import { useLastUpdateTime } from "@/hooks/useLastUpdateTime";
import { DATA_FRESHNESS_MS } from "@/data/constants";

const mockUseMarketItems = vi.mocked(useMarketItems);
const mockUseLastUpdateTime = vi.mocked(useLastUpdateTime);

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

  });

  it("deve renderizar titulo e descricao", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Market Dashboard")).toBeInTheDocument();
    expect(
      screen.getByText("Real-time price data across all Albion Online cities"),
    ).toBeInTheDocument();
  });

  it("deve remover o botão manual de refresh", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("button", { name: /refresh data/i })).not.toBeInTheDocument();
  });

  it("deve configurar auto-refresh de 15 min em marketItems e lastUpdateTime", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(mockUseMarketItems).toHaveBeenCalledWith({ refetchInterval: DATA_FRESHNESS_MS });
    expect(mockUseLastUpdateTime).toHaveBeenCalledWith({ refetchInterval: DATA_FRESHNESS_MS });
  });

  it("deve mostrar indicador Syncing... durante loading", () => {
    mockUseMarketItems.mockReturnValue({
      data: [],
      isLoading: true,
    } as ReturnType<typeof useMarketItems>);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Syncing...")).toBeInTheDocument();
  });

  it("deve exibir estado Awaiting first sync quando não há timestamp", () => {
    mockUseLastUpdateTime.mockReturnValue({
      data: null,
      isLoading: false,
    } as ReturnType<typeof useLastUpdateTime>);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("auto-refresh-status")).toHaveTextContent("Awaiting first sync");
  });

  it("deve exibir Updated just now quando atualização é menor que 1 minuto", () => {
    mockUseLastUpdateTime.mockReturnValue({
      data: new Date().toISOString(),
      isLoading: false,
    } as ReturnType<typeof useLastUpdateTime>);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("auto-refresh-status")).toHaveTextContent("Updated just now");
  });

  it("deve exibir Updated X min ago quando atualização é maior que 1 minuto", () => {
    mockUseLastUpdateTime.mockReturnValue({
      data: new Date(Date.now() - 5 * 60_000).toISOString(),
      isLoading: false,
    } as ReturnType<typeof useLastUpdateTime>);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("auto-refresh-status")).toHaveTextContent("Updated 5 min ago");
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

    const { container } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByTestId("auto-refresh-status")).toHaveTextContent("Syncing...");
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
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Last Update")).toBeInTheDocument();
  });
});
