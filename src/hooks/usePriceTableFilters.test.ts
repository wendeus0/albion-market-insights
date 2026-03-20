import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePriceTableFilters } from "@/hooks/usePriceTableFilters";
import type { MarketItem } from "@/data/types";

const STORAGE_KEY = "albion_price_filters";

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
    itemId: "T4_BAG@2",
    itemName: "Bag T4.2",
    city: "Martlock",
    sellPrice: 65_000,
    buyPrice: 50_000,
    spread: 15_000,
    spreadPercent: 30,
    timestamp: "2026-03-19T10:00:00.000Z",
    tier: "T4",
    quality: "Outstanding",
    priceHistory: [62_000, 63_000, 65_000],
  },
];

describe("usePriceTableFilters", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve restaurar filtros persistidos ao inicializar", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cityFilter: "Martlock", minPrice: "60000" }),
    );

    const { result } = renderHook(() => usePriceTableFilters(mockItems));

    expect(result.current.filters.cityFilter).toBe("Martlock");
    expect(result.current.filters.minPrice).toBe("60000");
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.itemName).toBe("Bag T4.2");
  });

  it("deve aplicar busca textual junto com filtros persistíveis", () => {
    const { result } = renderHook(() => usePriceTableFilters(mockItems));

    act(() => {
      result.current.setSearch("sword");
      result.current.setCityFilter("Caerleon");
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.itemId).toBe("T4_MAIN_SWORD");
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("deve aplicar filtros de tier, quality, enchant e ranges numéricos", () => {
    const { result } = renderHook(() => usePriceTableFilters(mockItems));

    act(() => {
      result.current.setTierFilter("T4");
      result.current.setQualityFilter("Outstanding");
      result.current.setEnchantFilter("2");
      result.current.setMinPrice("60000");
      result.current.setMaxPrice("70000");
      result.current.setMinSpread("20");
      result.current.setMaxSpread("35");
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.itemId).toBe("T4_BAG@2");
    expect(result.current.activeFilterCount).toBe(7);
  });

  it("deve suportar enchant 0 para itens sem sufixo", () => {
    const { result } = renderHook(() => usePriceTableFilters(mockItems));

    act(() => {
      result.current.setEnchantFilter("0");
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0]?.itemId).toBe("T4_MAIN_SWORD");
  });

  it("deve persistir somente filtros persistíveis no storage", () => {
    const { result } = renderHook(() => usePriceTableFilters(mockItems));

    act(() => {
      result.current.setSearch("bag");
      result.current.setCategoryFilter("bags");
      result.current.setCityFilter("Martlock");
      result.current.setTierFilter("T4");
      result.current.setQualityFilter("Outstanding");
      result.current.setEnchantFilter("2");
      result.current.setMinPrice("60000");
      result.current.setMaxPrice("70000");
      result.current.setMinSpread("20");
      result.current.setMaxSpread("35");
    });

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");

    expect(persisted.search).toBeUndefined();
    expect(persisted.categoryFilter).toBe("bags");
    expect(persisted.cityFilter).toBe("Martlock");
    expect(persisted.tierFilter).toBe("T4");
    expect(persisted.qualityFilter).toBe("Outstanding");
    expect(persisted.enchantFilter).toBe("2");
    expect(persisted.minPrice).toBe("60000");
    expect(persisted.maxPrice).toBe("70000");
    expect(persisted.minSpread).toBe("20");
    expect(persisted.maxSpread).toBe("35");
  });

  it("deve limpar filtros e remover persistencia ao executar clearAllFilters", () => {
    const { result } = renderHook(() => usePriceTableFilters(mockItems));

    act(() => {
      result.current.setCategoryFilter("bags");
      result.current.setMinSpread("20");
    });

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filters.categoryFilter).toBe("all");
    expect(result.current.filters.minSpread).toBe("");
    expect(result.current.hasActiveFilters).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
