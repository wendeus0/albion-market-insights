import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAlertPoller } from "./useAlertPoller";
import { useMarketItems } from "./useMarketItems";
import { useAlerts } from "./useAlerts";
import { useProfile } from "./useProfile";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "sonner";
import type { MarketItem, Alert } from "@/data/types";

// Mock dependencies
vi.mock("./useMarketItems");
vi.mock("./useAlerts");
vi.mock("./useProfile");
vi.mock("@/contexts/useAuth");
vi.mock("sonner");
vi.mock("@/services/alert.engine", () => ({
  checkAlerts: vi.fn(),
}));
vi.mock("@/services/alert.notifications", () => ({
  recordDiscordAlertTrigger: vi.fn(),
  sendDiscordWebhook: vi.fn(),
}));

import { checkAlerts } from "@/services/alert.engine";
import {
  recordDiscordAlertTrigger,
  sendDiscordWebhook,
} from "@/services/alert.notifications";

describe("useAlertPoller", () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();

    // Mock localStorage
    localStorageMock = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
      },
      writable: true,
    });

    vi.mocked(useMarketItems).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      isLoading: false,
      error: null,
      isError: false,
    } as ReturnType<typeof useProfile>);
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(checkAlerts).mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorageMock = {};
  });

  it("não deve disparar notificações quando não há itens", () => {
    vi.mocked(useMarketItems).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: [{ id: "1" } as Alert],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);

    renderHook(() => useAlertPoller());

    expect(checkAlerts).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it("não deve disparar notificações quando não há alertas", () => {
    vi.mocked(useMarketItems).mockReturnValue({
      data: [{ itemId: "T4_BAG" } as MarketItem],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);

    renderHook(() => useAlertPoller());

    expect(checkAlerts).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it("deve chamar checkAlerts quando há itens e alertas", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 1000,
        buyPrice: 900,
        spread: 100,
        spreadPercent: 10,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1500,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([]);

    renderHook(() => useAlertPoller());

    expect(checkAlerts).toHaveBeenCalledWith(mockItems, mockAlerts);
  });

  it("deve disparar notificação quando alerta é acionado", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 1000,
        buyPrice: 900,
        spread: 100,
        spreadPercent: 10,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1500,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([
      {
        alert: mockAlerts[0],
        item: mockItems[0],
        currentPrice: 1000,
      },
    ]);

    renderHook(() => useAlertPoller());

    expect(toast.warning).toHaveBeenCalledWith(
      "⚠️ Bag — abaixo de 1,500",
      expect.objectContaining({
        description: "Preço atual: 1,000 em Caerleon",
        duration: 8000,
      }),
    );
  });

  it("marca alerta para DM quando o perfil tiver Discord vinculado", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 1000,
        buyPrice: 900,
        spread: 100,
        spreadPercent: 10,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1500,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123", email: "test@test.com" } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: "user-123",
        discordId: "discord-user-1",
        discordUsername: "AlbionUser",
        discordDmEnabled: true,
        discordWebhookUrl: null,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      isLoading: false,
      error: null,
      isError: false,
    } as ReturnType<typeof useProfile>);
    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([
      { alert: mockAlerts[0], item: mockItems[0], currentPrice: 1000 },
    ]);

    renderHook(() => useAlertPoller());

    expect(recordDiscordAlertTrigger).toHaveBeenCalledWith("1");
    expect(sendDiscordWebhook).not.toHaveBeenCalled();
  });

  it("usa webhook quando o perfil nao estiver vinculado ao Discord", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 1000,
        buyPrice: 900,
        spread: 100,
        spreadPercent: 10,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1500,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123", email: "test@test.com" } as never,
      loading: false,
      isAuthenticated: true,
      signInWithDiscord: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: "user-123",
        discordId: null,
        discordUsername: null,
        discordDmEnabled: false,
        discordWebhookUrl: "https://discord.com/api/webhooks/test",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      isLoading: false,
      error: null,
      isError: false,
    } as ReturnType<typeof useProfile>);
    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([
      { alert: mockAlerts[0], item: mockItems[0], currentPrice: 1000 },
    ]);

    renderHook(() => useAlertPoller());

    expect(sendDiscordWebhook).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/test",
      mockAlerts[0],
      mockItems[0],
      1000,
      undefined,
    );
  });

  it("deve respeitar cooldown de 60 minutos entre notificações", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 1000,
        buyPrice: 900,
        spread: 100,
        spreadPercent: 10,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1500,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([
      {
        alert: mockAlerts[0],
        item: mockItems[0],
        currentPrice: 1000,
      },
    ]);

    const { rerender } = renderHook(() => useAlertPoller());

    // First notification should fire
    expect(toast.warning).toHaveBeenCalledTimes(1);

    // Rerender with same data (simulating items/alerts change)
    rerender();

    // Should not fire again due to cooldown
    expect(toast.warning).toHaveBeenCalledTimes(1);
  });

  it("deve permitir nova notificação após cooldown", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 1000,
        buyPrice: 900,
        spread: 100,
        spreadPercent: 10,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1500,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([
      {
        alert: mockAlerts[0],
        item: mockItems[0],
        currentPrice: 1000,
      },
    ]);

    renderHook(() => useAlertPoller());

    // First notification
    expect(toast.warning).toHaveBeenCalledTimes(1);

    // Advance time by 61 minutes (past cooldown)
    vi.advanceTimersByTime(61 * 60 * 1000);

    // Trigger effect by changing items
    const newItems = [...mockItems];
    vi.mocked(useMarketItems).mockReturnValue({
      data: newItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);

    renderHook(() => useAlertPoller());

    // Should fire again after cooldown
    expect(toast.warning).toHaveBeenCalledTimes(2);
  });

  it("deve formatar mensagem corretamente para condição 'above'", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 2000,
        buyPrice: 1900,
        spread: 100,
        spreadPercent: 5,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "above",
        threshold: 1500,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([
      {
        alert: mockAlerts[0],
        item: mockItems[0],
        currentPrice: 2000,
      },
    ]);

    renderHook(() => useAlertPoller());

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("acima de 1,500"),
      expect.any(Object),
    );
  });

  it("deve formatar mensagem corretamente para condição 'change'", () => {
    const mockItems: MarketItem[] = [
      {
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        sellPrice: 1100,
        buyPrice: 1000,
        spread: 100,
        spreadPercent: 10,
        timestamp: "2026-03-18T00:00:00Z",
        tier: "T4",
        quality: "Normal",
        priceHistory: [],
      },
    ];
    const mockAlerts: Alert[] = [
      {
        id: "1",
        itemId: "T4_BAG",
        itemName: "Bag",
        city: "Caerleon",
        condition: "change",
        threshold: 5,
        isActive: true,
        createdAt: "2026-03-18T00:00:00Z",
        notifications: { inApp: true, email: false },
      },
    ];

    vi.mocked(useMarketItems).mockReturnValue({
      data: mockItems,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useMarketItems>);
    vi.mocked(useAlerts).mockReturnValue({
      data: mockAlerts,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useAlerts>);
    vi.mocked(checkAlerts).mockReturnValue([
      {
        alert: mockAlerts[0],
        item: mockItems[0],
        currentPrice: 1100,
        priceChangePercent: 10.0, // +10% de variação
      },
    ]);

    renderHook(() => useAlertPoller());

    expect(toast.warning).toHaveBeenCalledWith(
      expect.stringContaining("variação de +10.0%"),
      expect.any(Object),
    );
  });
});
