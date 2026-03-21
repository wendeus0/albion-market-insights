import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiMarketService } from "@/services/market.api";

const validApiResponse = [
  {
    item_id: "T4_MAIN_SWORD",
    city: "Caerleon",
    quality: 1,
    sell_price_min: 50000,
    sell_price_min_date: "2026-03-14T10:00:00",
    buy_price_max: 40000,
    buy_price_max_date: "2026-03-14T09:00:00",
  },
  {
    item_id: "T5_MAIN_SWORD",
    city: "Bridgewatch",
    quality: 2,
    sell_price_min: 80000,
    sell_price_min_date: "2026-03-14T10:00:00",
    buy_price_max: 60000,
    buy_price_max_date: "2026-03-14T09:00:00",
  },
];

// Mock AlertStorageService para não depender de localStorage
vi.mock("@/services/alert.storage", () => {
  function MockAlertStorageService() {
    return {
      getAlerts: vi.fn().mockReturnValue([]),
      saveAlert: vi.fn(),
      deleteAlert: vi.fn(),
    };
  }
  return { AlertStorageService: MockAlertStorageService };
});

describe("ApiMarketService", () => {
  let service: ApiMarketService;

  beforeEach(() => {
    localStorage.clear();
    service = new ApiMarketService();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("getItems()", () => {
    it("mapeia resposta válida da API para MarketItem[]", async () => {
      // Given
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(validApiResponse),
        }),
      );

      // When
      const items = await service.getItems();

      // Then
      expect(items.length).toBe(2);
      expect(items[0].itemId).toBe("T4_MAIN_SWORD");
      expect(items[0].city).toBe("Caerleon");
      expect(items[0].sellPrice).toBe(50000);
      expect(items[0].buyPrice).toBe(40000);
      expect(items[0].tier).toBe("T4");
      expect(items[0].quality).toBe("Normal");
    });

    it("filtra registros com campos inválidos sem crash (Zod)", async () => {
      // Given
      const responseWithInvalid = [
        ...validApiResponse,
        { item_id: "INVALID", city: "Caerleon", quality: 99 }, // quality fora do range
        { item_id: "MISSING_PRICES" }, // sem campos obrigatórios
      ];
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(responseWithInvalid),
        }),
      );

      // When
      const items = await service.getItems();

      // Then
      expect(items.length).toBe(2); // apenas os válidos
    });

    it("retorna mock data em erro de rede", async () => {
      // Given
      vi.useFakeTimers();
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network error")),
      );

      // When — fetchWithRetry retenta antes de esgotar; fake timers avançam os delays
      const promise = service.getItems();
      await vi.runAllTimersAsync();
      const items = await promise;

      // Then
      expect(items.length).toBeGreaterThan(0);
      vi.useRealTimers();
    }, 10_000);

    it("retorna mock data quando API retorna status != 200", async () => {
      // Given
      vi.useFakeTimers();
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 503,
          json: vi.fn().mockResolvedValue([]),
        }),
      );

      // When — 503 é retentável; fake timers avançam os delays de backoff
      const promise = service.getItems();
      await vi.runAllTimersAsync();
      const items = await promise;

      // Then
      expect(items.length).toBeGreaterThan(0);
      vi.useRealTimers();
    }, 10_000);

    it("retorna mock data em timeout (>15s)", async () => {
      // Given
      vi.useFakeTimers();
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation((_url: string, options?: RequestInit) => {
          return new Promise((_resolve, reject) => {
            const signal = options?.signal as AbortSignal | undefined;
            if (signal) {
              signal.addEventListener("abort", () => {
                reject(
                  new DOMException("The operation was aborted.", "AbortError"),
                );
              });
            }
          });
        }),
      );

      // When
      const promise = service.getItems();
      vi.advanceTimersByTime(15_001);
      const items = await promise;

      // Then
      expect(items.length).toBeGreaterThan(0);
      vi.useRealTimers();
    });

    it("aplica nome legível via ITEM_NAMES", async () => {
      // Given
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(validApiResponse),
        }),
      );

      // When
      const items = await service.getItems();

      // Then
      expect(items[0].itemName).toBe("Adept's Broadsword");
    });
  });

  describe("getTopProfitable()", () => {
    it("retorna itens ordenados por spreadPercent decrescente", async () => {
      // Given
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(validApiResponse),
        }),
      );

      // When
      const items = await service.getTopProfitable(2);

      // Then
      expect(items.length).toBeLessThanOrEqual(2);
      if (items.length > 1) {
        expect(items[0].spreadPercent).toBeGreaterThanOrEqual(
          items[1].spreadPercent,
        );
      }
    });
  });

  describe("getLastUpdateTime()", () => {
    it("retorna null antes do primeiro fetch bem-sucedido", async () => {
      const lastUpdate = await service.getLastUpdateTime();
      expect(lastUpdate).toBeNull();
    });
  });

  describe("fallback desabilitado", () => {
    it("deve lançar erro e marcar degraded quando API retorna vazio sem fallback", async () => {
      const dataSourceModule = await import("@/services/dataSource.manager");
      const shouldUseMockFallbackSpy = vi
        .spyOn(dataSourceModule, "shouldUseMockFallback")
        .mockReturnValue(false);
      const degradedSpy = vi.spyOn(
        dataSourceModule.dataSourceManager,
        "setDegraded",
      );

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        }),
      );

      await expect(service.getItems()).rejects.toThrow(
        "API returned empty data",
      );
      expect(degradedSpy).toHaveBeenCalled();
      shouldUseMockFallbackSpy.mockRestore();
    });
  });

  describe("console output", () => {
    it("não chama console.log durante fetch bem-sucedido", async () => {
      // Given
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(validApiResponse),
        }),
      );

      // When
      await service.getItems();

      // Then
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("não chama console.warn nem console.error em erro de rede (fallback)", async () => {
      // Given
      vi.useFakeTimers();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network error")),
      );

      // When
      const promise = service.getItems();
      await vi.runAllTimersAsync();
      await promise;

      // Then
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    }, 10_000);

    it("não chama console.warn em falha de histórico por cidade", async () => {
      // Given
      vi.useFakeTimers();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      let callCount = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue(validApiResponse),
            });
          }
          return Promise.reject(new Error("History unavailable"));
        }),
      );

      // When
      const promise = service.getItems();
      await vi.runAllTimersAsync();
      await promise;

      // Then
      expect(warnSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    }, 10_000);
  });

  describe("albionRecordToMarketItem()", () => {
    it("mapeia quality numérica corretamente", async () => {
      // Given
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue([
            { ...validApiResponse[0], quality: 1 },
            { ...validApiResponse[1], quality: 2 },
          ]),
        }),
      );

      // When
      const items = await service.getItems();

      // Then
      expect(items[0].quality).toBe("Normal");
      expect(items[1].quality).toBe("Good");
    });

    it("calcula spread e spreadPercent corretamente", async () => {
      // Given
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue([validApiResponse[0]]),
        }),
      );

      // When
      const items = await service.getItems();

      // Then
      expect(items[0].spread).toBe(10000);
      expect(items[0].spreadPercent).toBeCloseTo(25, 0);
    });
  });
});
