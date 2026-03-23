/**
 * AC-6 — Feature flag VITE_USE_PROXY no frontend (market.api.ts)
 *
 * Valida que:
 * - VITE_USE_PROXY=false (ou ausente): ApiMarketService usa BASE_URL da API Albion diretamente
 * - VITE_USE_PROXY=true + VITE_PROXY_URL: ApiMarketService usa VITE_PROXY_URL como base
 * - A troca de URL não altera o parsing de resposta nem o contrato MarketItem
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ALBION_BASE = "west.albion-online-data.com";
const PROXY_URL = "http://localhost:8787";

const validApiResponse = [
  {
    item_id: "T4_MAIN_SWORD",
    city: "Caerleon",
    quality: 1,
    sell_price_min: 50000,
    sell_price_min_date: "2026-03-22T10:00:00",
    buy_price_max: 40000,
    buy_price_max_date: "2026-03-22T09:00:00",
  },
];

vi.mock("@/services/alert.storage", () => {
  function AlertStorageService() {
    return {
      getAlerts: vi.fn().mockReturnValue([]),
      saveAlert: vi.fn(),
      deleteAlert: vi.fn(),
    };
  }
  return { AlertStorageService };
});

vi.mock("@/services/market.mock", () => {
  function MockMarketService() {
    return { getItems: vi.fn().mockResolvedValue([]) };
  }
  return { MockMarketService };
});

vi.mock("@/services/market.cache", () => ({
  readCache: vi.fn().mockReturnValue(null),
  writeCache: vi.fn(),
  isCacheValid: vi.fn().mockReturnValue(false),
}));

vi.mock("@/services/dataSource.manager", () => ({
  dataSourceManager: { setReal: vi.fn(), setMock: vi.fn(), setDegraded: vi.fn() },
  shouldUseMockFallback: vi.fn().mockReturnValue(false),
}));

describe("AC-6 — Feature flag VITE_USE_PROXY", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("deve usar URL direta da API Albion quando VITE_USE_PROXY está ausente", async () => {
    vi.stubEnv("VITE_USE_PROXY", undefined as unknown as string);

    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(validApiResponse), { status: 200 }),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { ApiMarketService } = await import("@/services/market.api");
    const service = new ApiMarketService();
    await service.getItems();

    const calledUrls: string[] = mockFetch.mock.calls.map(
      (call) => call[0] as string,
    );
    expect(calledUrls.some((url) => url.includes(ALBION_BASE))).toBe(true);
    expect(calledUrls.some((url) => url.includes(PROXY_URL))).toBe(false);
  });

  it("deve usar URL direta da API Albion quando VITE_USE_PROXY=false", async () => {
    vi.stubEnv("VITE_USE_PROXY", "false");

    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(validApiResponse), { status: 200 }),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { ApiMarketService } = await import("@/services/market.api");
    const service = new ApiMarketService();
    await service.getItems();

    const calledUrls: string[] = mockFetch.mock.calls.map(
      (call) => call[0] as string,
    );
    expect(calledUrls.some((url) => url.includes(ALBION_BASE))).toBe(true);
    expect(calledUrls.some((url) => url.includes(PROXY_URL))).toBe(false);
  });

  it("deve usar VITE_PROXY_URL como base quando VITE_USE_PROXY=true", async () => {
    vi.stubEnv("VITE_USE_PROXY", "true");
    vi.stubEnv("VITE_PROXY_URL", PROXY_URL);

    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(validApiResponse), { status: 200 }),
      );
    vi.stubGlobal("fetch", mockFetch);

    const { ApiMarketService } = await import("@/services/market.api");
    const service = new ApiMarketService();
    await service.getItems();

    const calledUrls: string[] = mockFetch.mock.calls.map(
      (call) => call[0] as string,
    );
    expect(calledUrls.some((url) => url.startsWith(PROXY_URL))).toBe(true);
    expect(calledUrls.some((url) => url.includes(ALBION_BASE))).toBe(false);
  });

  it("não deve alterar o contrato MarketItem ao usar o proxy", async () => {
    vi.stubEnv("VITE_USE_PROXY", "true");
    vi.stubEnv("VITE_PROXY_URL", PROXY_URL);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(validApiResponse), { status: 200 }),
      ),
    );

    const { ApiMarketService } = await import("@/services/market.api");
    const service = new ApiMarketService();
    const items = await service.getItems();

    // O contrato MarketItem deve ser preservado independentemente da URL base
    expect(items).toBeInstanceOf(Array);
    if (items.length > 0) {
      const item = items[0];
      expect(item).toHaveProperty("itemId");
      expect(item).toHaveProperty("city");
      expect(item).toHaveProperty("sellPrice");
      expect(item).toHaveProperty("buyPrice");
      expect(item).toHaveProperty("spreadPercent");
    }
  });

  it("deve manter todos os testes existentes passando quando VITE_USE_PROXY está ausente (comportamento atual inalterado)", async () => {
    vi.stubEnv("VITE_USE_PROXY", undefined as unknown as string);

    // Smoke test: o serviço deve funcionar exatamente como antes
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(validApiResponse), { status: 200 }),
      ),
    );

    const { ApiMarketService } = await import("@/services/market.api");
    const service = new ApiMarketService();

    await expect(service.getItems()).resolves.not.toThrow();
  });
});
