import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePriceTableSort } from "@/hooks/usePriceTableSort";
import type { MarketItem } from "@/data/types";

const mockItems: MarketItem[] = [
  {
    itemId: "T4_MAIN_SWORD",
    itemName: "Broadsword T4",
    city: "Caerleon",
    sellPrice: 50_000,
    buyPrice: 40_000,
    spread: 10_000,
    spreadPercent: 25,
    timestamp: "2026-03-19T10:00:00.000Z",
    tier: "T4",
    quality: "Normal",
    priceHistory: [45_000, 46_000, 47_000],
  },
  {
    itemId: "T5_MAIN_AXE",
    itemName: "Battleaxe T5",
    city: "Bridgewatch",
    sellPrice: 80_000,
    buyPrice: 60_000,
    spread: 20_000,
    spreadPercent: 33,
    timestamp: "2026-03-19T09:00:00.000Z",
    tier: "T5",
    quality: "Normal",
    priceHistory: [75_000, 77_000, 80_000],
  },
];

describe("usePriceTableSort", () => {
  it("deve iniciar ordenado por spreadPercent desc", () => {
    const { result } = renderHook(() => usePriceTableSort(mockItems));

    expect(result.current.sortField).toBe("spreadPercent");
    expect(result.current.sortDirection).toBe("desc");
    expect(result.current.sortedItems[0]?.itemId).toBe("T5_MAIN_AXE");
  });

  it("deve alternar direcao ao ordenar o mesmo campo duas vezes", () => {
    const { result } = renderHook(() => usePriceTableSort(mockItems));

    act(() => {
      result.current.handleSort("sellPrice");
    });

    expect(result.current.sortField).toBe("sellPrice");
    expect(result.current.sortDirection).toBe("desc");
    expect(result.current.sortedItems[0]?.itemId).toBe("T5_MAIN_AXE");

    act(() => {
      result.current.handleSort("sellPrice");
    });

    expect(result.current.sortDirection).toBe("asc");
    expect(result.current.sortedItems[0]?.itemId).toBe("T4_MAIN_SWORD");
  });
});
