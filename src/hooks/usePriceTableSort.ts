import { useMemo, useState } from "react";
import type { MarketItem } from "@/data/types";

export type SortField =
  | "itemName"
  | "city"
  | "sellPrice"
  | "buyPrice"
  | "spread"
  | "spreadPercent"
  | "timestamp";

export type SortDirection = "asc" | "desc";

export function usePriceTableSort(items: MarketItem[]) {
  const [sortField, setSortField] = useState<SortField>("spreadPercent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedItems = useMemo(() => {
    const result = [...items];

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [items, sortDirection, sortField]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  };

  return {
    sortField,
    sortDirection,
    sortedItems,
    handleSort,
  };
}
