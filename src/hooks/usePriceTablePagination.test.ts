import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePriceTablePagination } from "@/hooks/usePriceTablePagination";
import type { MarketItem } from "@/data/types";

const manyItems: MarketItem[] = Array.from({ length: 25 }, (_, index) => ({
  itemId: `T4_ITEM_${index}`,
  itemName: `Item ${index}`,
  city: "Caerleon",
  sellPrice: 50_000 + index,
  buyPrice: 40_000 + index,
  spread: 10_000,
  spreadPercent: 25,
  timestamp: "2026-03-19T10:00:00.000Z",
  tier: "T4",
  quality: "Normal",
  priceHistory: [45_000, 46_000, 47_000],
}));

describe("usePriceTablePagination", () => {
  it("deve paginar itens e calcular paginas visiveis", () => {
    const { result } = renderHook(() => usePriceTablePagination(manyItems, 10));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.visiblePages).toEqual([1, 2, 3]);
  });

  it("deve resetar para a primeira pagina quando resetPage for chamado", () => {
    const { result } = renderHook(() => usePriceTablePagination(manyItems, 10));

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.currentPage).toBe(3);
    expect(result.current.paginatedItems[0]?.itemId).toBe("T4_ITEM_20");

    act(() => {
      result.current.resetPage();
    });

    expect(result.current.currentPage).toBe(1);
    expect(result.current.paginatedItems[0]?.itemId).toBe("T4_ITEM_0");
  });
});
