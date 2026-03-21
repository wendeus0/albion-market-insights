import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
});
