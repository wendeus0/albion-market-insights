import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.stubEnv("VITE_USE_PROXY", "false");

const MOCK_IDS = ["T4_MAIN_SWORD"];

vi.mock("@/data/constants", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/constants")>();

  return {
    ...actual,
    ITEM_IDS: MOCK_IDS,
    ITEM_NAMES: actual.ITEM_NAMES,
  };
});

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

vi.mock("@/services/market.mock", () => {
  function MockMarketService() {
    return { getItems: vi.fn().mockResolvedValue([]) };
  }

  return { MockMarketService };
});

describe("ApiMarketService - history by quality", () => {
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

  it("deve enriquecer cada item com o historico da propria qualidade", async () => {
    const priceResponse = [
      {
        item_id: "T4_MAIN_SWORD",
        city: "Caerleon",
        quality: 1,
        sell_price_min: 50_000,
        sell_price_min_date: "2026-03-21T10:00:00",
        buy_price_max: 40_000,
        buy_price_max_date: "2026-03-21T09:00:00",
      },
      {
        item_id: "T4_MAIN_SWORD",
        city: "Caerleon",
        quality: 2,
        sell_price_min: 70_000,
        sell_price_min_date: "2026-03-21T10:00:00",
        buy_price_max: 60_000,
        buy_price_max_date: "2026-03-21T09:00:00",
      },
    ];

    const historyResponse = [
      {
        item_id: "T4_MAIN_SWORD",
        location: "Caerleon",
        quality: 1,
        data: [
          {
            item_count: 3,
            avg_price: 45_000,
            timestamp: "2026-03-21T08:00:00",
          },
          {
            item_count: 2,
            avg_price: 50_000,
            timestamp: "2026-03-21T09:00:00",
          },
        ],
      },
      {
        item_id: "T4_MAIN_SWORD",
        location: "Caerleon",
        quality: 2,
        data: [
          {
            item_count: 4,
            avg_price: 65_000,
            timestamp: "2026-03-21T08:00:00",
          },
          {
            item_count: 2,
            avg_price: 70_000,
            timestamp: "2026-03-21T09:00:00",
          },
        ],
      },
    ];

    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/stats/prices/")) {
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue(priceResponse),
        });
      }

      if (
        url.includes("/stats/history/") &&
        url.includes("locations=Caerleon")
      ) {
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue(historyResponse),
        });
      }

      return Promise.resolve({ ok: true, json: vi.fn().mockResolvedValue([]) });
    });

    vi.stubGlobal("fetch", fetchSpy);

    const items = await service.getItems();

    const normalItem = items.find((item) => item.quality === "Normal");
    const goodItem = items.find((item) => item.quality === "Good");
    const historyCalls = fetchSpy.mock.calls.filter(([url]) =>
      (url as string).includes("/stats/history/"),
    );

    expect(normalItem?.priceHistory).toEqual([45_000, 50_000]);
    expect(goodItem?.priceHistory).toEqual([65_000, 70_000]);
    expect(
      historyCalls.some(([url]) => (url as string).includes("qualities=1,2")),
    ).toBe(true);
  });

  it("deve manter fallback no item sem historico da qualidade correspondente", async () => {
    const priceResponse = [
      {
        item_id: "T4_MAIN_SWORD",
        city: "Caerleon",
        quality: 1,
        sell_price_min: 50_000,
        sell_price_min_date: "2026-03-21T10:00:00",
        buy_price_max: 40_000,
        buy_price_max_date: "2026-03-21T09:00:00",
      },
      {
        item_id: "T4_MAIN_SWORD",
        city: "Caerleon",
        quality: 2,
        sell_price_min: 70_000,
        sell_price_min_date: "2026-03-21T10:00:00",
        buy_price_max: 60_000,
        buy_price_max_date: "2026-03-21T09:00:00",
      },
    ];

    const historyResponse = [
      {
        item_id: "T4_MAIN_SWORD",
        location: "Caerleon",
        quality: 1,
        data: [
          {
            item_count: 3,
            avg_price: 45_000,
            timestamp: "2026-03-21T08:00:00",
          },
          {
            item_count: 2,
            avg_price: 50_000,
            timestamp: "2026-03-21T09:00:00",
          },
        ],
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/stats/prices/")) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(priceResponse),
          });
        }

        if (
          url.includes("/stats/history/") &&
          url.includes("locations=Caerleon")
        ) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(historyResponse),
          });
        }

        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([]),
        });
      }),
    );

    const items = await service.getItems();

    const normalItem = items.find((item) => item.quality === "Normal");
    const goodItem = items.find((item) => item.quality === "Good");

    expect(normalItem?.priceHistory).toEqual([45_000, 50_000]);
    expect(goodItem?.priceHistory).toEqual([70_000]);
  });
});
