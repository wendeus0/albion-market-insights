import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Garante que os testes de dedup usam URL direta (não proxy)
// sem essa stub, VITE_USE_PROXY=true do .env muda o formato de URL
// e os mocks de fetch que checam "/stats/prices/" deixam de bater
vi.stubEnv("VITE_USE_PROXY", "false");

const MOCK_IDS = Array.from({ length: 200 }, (_, i) => `T4_ITEM_${i}`);

vi.mock("@/data/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/constants")>();

  return {
    ...actual,
    ITEM_IDS: MOCK_IDS,
    ITEM_NAMES: actual.ITEM_NAMES,
  };
});

vi.mock("@/services/alert.storage", () => ({
  AlertStorageService: class {
    getAlerts = vi.fn().mockReturnValue([]);
    saveAlert = vi.fn();
    deleteAlert = vi.fn();
  },
}));

vi.mock("@/services/market.mock", () => ({
  MockMarketService: class {
    getItems = vi.fn().mockResolvedValue([]);
  },
}));

describe("ApiMarketService - deduplicacao por recencia", () => {
  let service: import("@/services/market.api").ApiMarketService;

  beforeEach(async () => {
    localStorage.clear();
    const { ApiMarketService } = await import("@/services/market.api");
    service = new ApiMarketService();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("deve manter o registro mais recente quando houver duplicata da mesma chave", async () => {
    let priceCallIndex = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          priceCallIndex += 1;

          if (priceCallIndex === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue([
                {
                  item_id: "T4_ITEM_0",
                  city: "Caerleon",
                  quality: 1,
                  sell_price_min: 50_000,
                  sell_price_min_date: "2026-03-21T09:00:00",
                  buy_price_max: 40_000,
                  buy_price_max_date: "2026-03-21T09:00:00",
                },
              ]),
            });
          }

          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 55_000,
                sell_price_min_date: "2026-03-21T10:00:00",
                buy_price_max: 44_000,
                buy_price_max_date: "2026-03-21T10:00:00",
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].sellPrice).toBe(55_000);
    expect(items[0].buyPrice).toBe(44_000);
    expect(items[0].timestamp).toBe("2026-03-21T10:00:00");
  });

  it("deve preferir o registro mais confiavel quando a recencia empata", async () => {
    let priceCallIndex = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          priceCallIndex += 1;

          if (priceCallIndex === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue([
                {
                  item_id: "T4_ITEM_0",
                  city: "Caerleon",
                  quality: 1,
                  sell_price_min: 55_000,
                  sell_price_min_date: "2026-03-21T10:00:00",
                  buy_price_max: 0,
                  buy_price_max_date: "2026-03-21T10:00:00",
                },
              ]),
            });
          }

          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 55_000,
                sell_price_min_date: "2026-03-21T10:00:00",
                buy_price_max: 44_000,
                buy_price_max_date: "2026-03-21T10:00:00",
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].buyPrice).toBe(44_000);
    expect(items[0].spread).toBe(11_000);
  });

  it("deve manter registros unicos e consolidar duplicados sem repetir a chave", async () => {
    let priceCallIndex = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          priceCallIndex += 1;

          if (priceCallIndex === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue([
                {
                  item_id: "T4_ITEM_0",
                  city: "Caerleon",
                  quality: 1,
                  sell_price_min: 50_000,
                  sell_price_min_date: "2026-03-21T09:00:00",
                  buy_price_max: 40_000,
                  buy_price_max_date: "2026-03-21T09:00:00",
                },
                {
                  item_id: "T4_ITEM_1",
                  city: "Bridgewatch",
                  quality: 1,
                  sell_price_min: 30_000,
                  sell_price_min_date: "2026-03-21T09:00:00",
                  buy_price_max: 20_000,
                  buy_price_max_date: "2026-03-21T09:00:00",
                },
              ]),
            });
          }

          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 60_000,
                sell_price_min_date: "2026-03-21T10:00:00",
                buy_price_max: 48_000,
                buy_price_max_date: "2026-03-21T10:00:00",
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(2);
    expect(items.filter((item) => item.itemId === "T4_ITEM_0")).toHaveLength(1);
    expect(items.find((item) => item.itemId === "T4_ITEM_0")?.sellPrice).toBe(
      60_000,
    );
    expect(items.find((item) => item.itemId === "T4_ITEM_1")).toMatchObject({
      itemId: "T4_ITEM_1",
      city: "Bridgewatch",
      quality: "Normal",
      sellPrice: 30_000,
      buyPrice: 20_000,
      timestamp: "2026-03-21T09:00:00",
    });
  });

  it("deve manter registro atual quando candidato for mais antigo", async () => {
    let priceCallIndex = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          priceCallIndex += 1;

          if (priceCallIndex === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue([
                {
                  item_id: "T4_ITEM_0",
                  city: "Caerleon",
                  quality: 1,
                  sell_price_min: 55_000,
                  sell_price_min_date: "2026-03-21T11:00:00",
                  buy_price_max: 44_000,
                  buy_price_max_date: "2026-03-21T11:00:00",
                },
              ]),
            });
          }

          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 50_000,
                sell_price_min_date: "2026-03-21T09:00:00",
                buy_price_max: 40_000,
                buy_price_max_date: "2026-03-21T09:00:00",
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].sellPrice).toBe(55_000);
    expect(items[0].buyPrice).toBe(44_000);
    expect(items[0].timestamp).toBe("2026-03-21T11:00:00");
  });

  it("deve manter registro atual quando candidato tiver menor completude de preco", async () => {
    let priceCallIndex = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          priceCallIndex += 1;

          if (priceCallIndex === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue([
                {
                  item_id: "T4_ITEM_0",
                  city: "Caerleon",
                  quality: 1,
                  sell_price_min: 55_000,
                  sell_price_min_date: "2026-03-21T10:00:00",
                  buy_price_max: 44_000,
                  buy_price_max_date: "2026-03-21T10:00:00",
                },
              ]),
            });
          }

          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 55_000,
                sell_price_min_date: "2026-03-21T10:00:00",
                buy_price_max: 0,
                buy_price_max_date: "2026-03-21T10:00:00",
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].buyPrice).toBe(44_000);
  });

  it("deve preferir candidato com maior confianca de timestamp quando recencia empata", async () => {
    let priceCallIndex = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          priceCallIndex += 1;

          if (priceCallIndex === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue([
                {
                  item_id: "T4_ITEM_0",
                  city: "Caerleon",
                  quality: 1,
                  sell_price_min: 52_000,
                  sell_price_min_date: "invalid-date",
                  buy_price_max: 41_000,
                  buy_price_max_date: "2026-03-21T10:00:00",
                },
              ]),
            });
          }

          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 56_000,
                sell_price_min_date: "2026-03-21T10:00:00",
                buy_price_max: 45_000,
                buy_price_max_date: "2026-03-21T09:00:00",
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].sellPrice).toBe(56_000);
    expect(items[0].buyPrice).toBe(45_000);
  });

  it("deve manter atual quando candidato tiver menor confianca de timestamp", async () => {
    let priceCallIndex = 0;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          priceCallIndex += 1;

          if (priceCallIndex === 1) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue([
                {
                  item_id: "T4_ITEM_0",
                  city: "Caerleon",
                  quality: 1,
                  sell_price_min: 57_000,
                  sell_price_min_date: "2026-03-21T10:00:00",
                  buy_price_max: 46_000,
                  buy_price_max_date: "2026-03-21T09:00:00",
                },
              ]),
            });
          }

          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 53_000,
                sell_price_min_date: "invalid-date",
                buy_price_max: 42_000,
                buy_price_max_date: "2026-03-21T10:00:00",
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].sellPrice).toBe(57_000);
    expect(items[0].buyPrice).toBe(46_000);
  });

  it("deve descartar registros invalidos durante parse do batch de precos", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                item_id: "T4_ITEM_0",
                city: "Caerleon",
                quality: 1,
                sell_price_min: 50_000,
                sell_price_min_date: "2026-03-21T10:00:00",
                buy_price_max: 40_000,
                buy_price_max_date: "2026-03-21T09:00:00",
              },
              {
                item_id: "INVALID",
                city: "Caerleon",
                quality: 99,
              },
            ]),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    expect(items).toHaveLength(1);
    expect(items[0].itemId).toBe("T4_ITEM_0");
  });

  it("deve retornar mapa vazio quando fetchHistoryBatch receber arrays vazios", async () => {
    const map = await (
      service as unknown as {
        fetchHistoryBatch: (
          itemIds: string[],
          city: "Caerleon",
          qualities: number[],
        ) => Promise<Map<string, number[]>>;
      }
    ).fetchHistoryBatch([], "Caerleon", []);

    expect(map.size).toBe(0);
  });
});
