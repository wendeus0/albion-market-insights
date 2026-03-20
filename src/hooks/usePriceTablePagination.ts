import { useEffect, useMemo, useState } from "react";
import type { MarketItem } from "@/data/types";

export function usePriceTablePagination(
  items: MarketItem[],
  itemsPerPage: number,
) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(
    () =>
      items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, items, itemsPerPage],
  );

  const visiblePages = useMemo(() => {
    if (totalPages === 0) {
      return [];
    }

    return Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
      if (totalPages <= 5) {
        return index + 1;
      }

      if (currentPage <= 3) {
        return index + 1;
      }

      if (currentPage >= totalPages - 2) {
        return totalPages - 4 + index;
      }

      return currentPage - 2 + index;
    });
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    visiblePages,
    setCurrentPage,
    goToPreviousPage: () => setCurrentPage((prev) => Math.max(1, prev - 1)),
    goToNextPage: () =>
      setCurrentPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1)),
    resetPage: () => setCurrentPage(1),
  };
}
