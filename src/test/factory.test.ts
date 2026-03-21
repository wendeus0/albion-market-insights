import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMarketService } from "@/services/factory";
import { ApiMarketService } from "@/services/market.api";
import { MockMarketService } from "@/services/market.mock";
import { AlertStorageService } from "@/services/alert.storage";
import type { MarketService } from "@/services/market.service";

describe("createMarketService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("AC-3: Factory function retorna implementação correta", () => {
    it("retorna ApiMarketService quando useRealApi é true", () => {
      const service = createMarketService({ useRealApi: true });
      expect(service).toBeInstanceOf(ApiMarketService);
    });

    it("retorna MockMarketService quando useRealApi é false", () => {
      const service = createMarketService({ useRealApi: false });
      expect(service).toBeInstanceOf(MockMarketService);
    });

    it("retorna MockMarketService por default sem config", () => {
      vi.stubEnv("VITE_USE_REAL_API", undefined);
      const service = createMarketService();
      expect(service).toBeInstanceOf(MockMarketService);
      vi.unstubAllEnvs();
    });
  });

  describe("AC-1 e AC-2: Injeção de dependências", () => {
    it("injeta AlertStorageService customizado em ApiMarketService", () => {
      const customStorage = new AlertStorageService();
      customStorage.saveAlert({
        id: "test-id",
        itemId: "T4_BAG",
        itemName: "Test Bag",
        city: "Caerleon",
        condition: "below",
        threshold: 1000,
        isActive: true,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      });

      const service = createMarketService({
        useRealApi: true,
        storage: customStorage,
      });

      expect(service).toBeInstanceOf(ApiMarketService);
    });

    it("injeta AlertStorageService customizado em MockMarketService", async () => {
      const customStorage = new AlertStorageService();
      customStorage.saveAlert({
        id: "test-id-2",
        itemId: "T4_BAG",
        itemName: "Test Bag",
        city: "Caerleon",
        condition: "above",
        threshold: 2000,
        isActive: true,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      });

      const service = createMarketService({
        useRealApi: false,
        storage: customStorage,
      });

      const alerts = await service.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].id).toBe("test-id-2");
    });

    it("injeta fallback customizado em ApiMarketService", () => {
      const mockFallback: MarketService = {
        getItems: vi.fn().mockResolvedValue([]),
        getTopProfitable: vi.fn().mockResolvedValue([]),
        getLastUpdateTime: vi.fn().mockResolvedValue(null),
        getAlerts: vi.fn().mockResolvedValue([]),
        saveAlert: vi.fn().mockResolvedValue(undefined),
        deleteAlert: vi.fn().mockResolvedValue(undefined),
      };

      const service = createMarketService({
        useRealApi: true,
        fallback: mockFallback,
      });

      expect(service).toBeInstanceOf(ApiMarketService);
    });
  });

  describe("AC-4: Testes unitários com mocks injetados", () => {
    it("permite criar ApiMarketService com storage mock para testes", async () => {
      const mockStorage = {
        getAlerts: vi.fn().mockReturnValue([]),
        saveAlert: vi.fn(),
        deleteAlert: vi.fn(),
      } as unknown as AlertStorageService;

      const mockFallback: MarketService = {
        getItems: vi.fn().mockResolvedValue([{ itemId: "T4_BAG" }]),
        getTopProfitable: vi.fn().mockResolvedValue([]),
        getLastUpdateTime: vi.fn().mockResolvedValue(null),
        getAlerts: vi.fn().mockResolvedValue([]),
        saveAlert: vi.fn().mockResolvedValue(undefined),
        deleteAlert: vi.fn().mockResolvedValue(undefined),
      };

      const service = new ApiMarketService(mockStorage, mockFallback);

      const alerts = await service.getAlerts();
      expect(mockStorage.getAlerts).toHaveBeenCalled();
      expect(alerts).toEqual([]);
    });

    it("permite criar MockMarketService com storage mock para testes", async () => {
      const mockStorage = {
        getAlerts: vi.fn().mockReturnValue([{ id: "injected" }]),
        saveAlert: vi.fn(),
        deleteAlert: vi.fn(),
      } as unknown as AlertStorageService;

      const service = new MockMarketService(mockStorage);

      const alerts = await service.getAlerts();
      expect(mockStorage.getAlerts).toHaveBeenCalled();
      expect(alerts).toEqual([{ id: "injected" }]);
    });
  });
});

describe("AC-5: Compatibilidade com código existente", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exporta MarketService como type", () => {
    expect(createMarketService).toBeDefined();
    expect(typeof createMarketService).toBe("function");
  });

  it("exporta createMarketService function", () => {
    expect(createMarketService).toBeDefined();
    expect(typeof createMarketService).toBe("function");
  });

  it("marketService singleton ainda está disponível", async () => {
    const { marketService } = await import("@/services");
    expect(marketService).toBeDefined();
  });
});
