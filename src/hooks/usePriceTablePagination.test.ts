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

  it("deve retornar lista vazia quando items estiver vazio", () => {
    const { result } = renderHook(() => usePriceTablePagination([], 10));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.paginatedItems).toHaveLength(0);
    expect(result.current.visiblePages).toEqual([]);
  });

  it("deve calcular paginacao correta com pagina unica", () => {
    const fewItems = manyItems.slice(0, 5);
    const { result } = renderHook(() => usePriceTablePagination(fewItems, 10));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toHaveLength(5);
    expect(result.current.visiblePages).toEqual([1]);
  });

  it("deve navegar para pagina anterior com goToPreviousPage", () => {
    const { result } = renderHook(() => usePriceTablePagination(manyItems, 10));

    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.goToPreviousPage();
    });
    expect(result.current.currentPage).toBe(1);
  });

  it("deve navegar para proxima pagina com goToNextPage", () => {
    const { result } = renderHook(() => usePriceTablePagination(manyItems, 10));

    act(() => {
      result.current.goToNextPage();
    });
    expect(result.current.currentPage).toBe(2);
  });

  it("deve manter na primeira pagina ao tentar ir anterior além do limite", () => {
    const { result } = renderHook(() => usePriceTablePagination(manyItems, 10));

    expect(result.current.currentPage).toBe(1);

    act(() => {
      result.current.goToPreviousPage();
    });
    expect(result.current.currentPage).toBe(1);
  });

  it("deve manter na ultima pagina ao tentar ir proxima além do limite", () => {
    const { result } = renderHook(() => usePriceTablePagination(manyItems, 10));

    act(() => {
      result.current.setCurrentPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.goToNextPage();
    });
    expect(result.current.currentPage).toBe(3);
  });

  it("deve ajustar pagina atual quando totalPages diminuir", () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: MarketItem[] }) =>
        usePriceTablePagination(items, 10),
      { initialProps: { items: manyItems } },
    );

    act(() => {
      result.current.setCurrentPage(3);
    });
    expect(result.current.currentPage).toBe(3);

    // Reduzir items para ter apenas 2 páginas
    const fewerItems = manyItems.slice(0, 15);
    rerender({ items: fewerItems });

    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(2);
  });

  it("deve resetar para pagina 1 quando items ficar vazio", () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: MarketItem[] }) =>
        usePriceTablePagination(items, 10),
      { initialProps: { items: manyItems } },
    );

    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(result.current.currentPage).toBe(2);

    // Esvaziar items
    rerender({ items: [] });

    expect(result.current.totalPages).toBe(0);
    expect(result.current.currentPage).toBe(1);
  });

  it("deve calcular visiblePages corretamente com muitas paginas no inicio", () => {
    const lotsOfItems: MarketItem[] = Array.from(
      { length: 100 },
      (_, index) => ({
        ...manyItems[0],
        itemId: `T4_ITEM_${index}`,
      }),
    );

    const { result } = renderHook(() =>
      usePriceTablePagination(lotsOfItems, 10),
    );

    // Página 2 (início) - deve mostrar [1, 2, 3, 4, 5]
    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(result.current.visiblePages).toEqual([1, 2, 3, 4, 5]);
  });

  it("deve calcular visiblePages corretamente com muitas paginas no meio", () => {
    const lotsOfItems: MarketItem[] = Array.from(
      { length: 100 },
      (_, index) => ({
        ...manyItems[0],
        itemId: `T4_ITEM_${index}`,
      }),
    );

    const { result } = renderHook(() =>
      usePriceTablePagination(lotsOfItems, 10),
    );

    // Página 5 (meio) - deve mostrar [3, 4, 5, 6, 7]
    act(() => {
      result.current.setCurrentPage(5);
    });
    expect(result.current.visiblePages).toEqual([3, 4, 5, 6, 7]);
  });

  it("deve calcular visiblePages corretamente com muitas paginas no final", () => {
    const lotsOfItems: MarketItem[] = Array.from(
      { length: 100 },
      (_, index) => ({
        ...manyItems[0],
        itemId: `T4_ITEM_${index}`,
      }),
    );

    const { result } = renderHook(() =>
      usePriceTablePagination(lotsOfItems, 10),
    );

    // Página 9 (próximo do fim) - deve mostrar [6, 7, 8, 9, 10]
    act(() => {
      result.current.setCurrentPage(9);
    });
    expect(result.current.visiblePages).toEqual([6, 7, 8, 9, 10]);

    // Página 10 (última) - deve mostrar [6, 7, 8, 9, 10]
    act(() => {
      result.current.setCurrentPage(10);
    });
    expect(result.current.visiblePages).toEqual([6, 7, 8, 9, 10]);
  });
});
