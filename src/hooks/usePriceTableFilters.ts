import { useEffect, useMemo, useRef, useState } from "react";
import { ITEM_CATALOG } from "@/data/constants";
import type { CatalogCategoryKey } from "@/data/constants";
import type { MarketItem } from "@/data/types";
import { filterStorage, type FilterState } from "@/services/filter.storage";

export interface PriceTableFilters extends FilterState {
  search: string;
}

const defaultFilters: PriceTableFilters = {
  search: "",
  categoryFilter: "all",
  cityFilter: "all",
  tierFilter: "all",
  qualityFilter: "all",
  enchantFilter: "all",
  minPrice: "",
  maxPrice: "",
  minSpread: "",
  maxSpread: "",
};

function getInitialFilters(): PriceTableFilters {
  return {
    ...defaultFilters,
    ...filterStorage.getFilters(),
  };
}

function getHasActiveFilters(filters: PriceTableFilters) {
  return (
    filters.categoryFilter !== "all" ||
    filters.cityFilter !== "all" ||
    filters.tierFilter !== "all" ||
    filters.qualityFilter !== "all" ||
    filters.enchantFilter !== "all" ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.minSpread) ||
    Boolean(filters.maxSpread)
  );
}

export function usePriceTableFilters(items: MarketItem[]) {
  const [filters, setFilters] = useState<PriceTableFilters>(getInitialFilters);
  const isInitialMount = useRef(true);
  const isClearingRef = useRef(false);

  const minPriceNumber = filters.minPrice
    ? Number.parseInt(filters.minPrice, 10)
    : null;
  const maxPriceNumber = filters.maxPrice
    ? Number.parseInt(filters.maxPrice, 10)
    : null;
  const minSpreadNumber = filters.minSpread
    ? Number.parseInt(filters.minSpread, 10)
    : null;
  const maxSpreadNumber = filters.maxSpread
    ? Number.parseInt(filters.maxSpread, 10)
    : null;

  const hasInvalidPriceRange =
    minPriceNumber !== null &&
    maxPriceNumber !== null &&
    minPriceNumber > maxPriceNumber;

  const hasInvalidSpreadRange =
    minSpreadNumber !== null &&
    maxSpreadNumber !== null &&
    minSpreadNumber > maxSpreadNumber;

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isClearingRef.current) {
      return;
    }

    filterStorage.saveFilters({
      categoryFilter: filters.categoryFilter,
      cityFilter: filters.cityFilter,
      tierFilter: filters.tierFilter,
      qualityFilter: filters.qualityFilter,
      enchantFilter: filters.enchantFilter,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minSpread: filters.minSpread,
      maxSpread: filters.maxSpread,
    });
  }, [filters]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.categoryFilter !== "all") {
      const ids = new Set(
        ITEM_CATALOG[filters.categoryFilter as CatalogCategoryKey].ids,
      );
      result = result.filter((item) => ids.has(item.itemId));
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchLower) ||
          item.itemId.toLowerCase().includes(searchLower),
      );
    }

    if (filters.cityFilter !== "all") {
      result = result.filter((item) => item.city === filters.cityFilter);
    }

    if (filters.tierFilter !== "all") {
      result = result.filter((item) => item.tier === filters.tierFilter);
    }

    if (filters.qualityFilter !== "all") {
      result = result.filter((item) => item.quality === filters.qualityFilter);
    }

    if (filters.enchantFilter !== "all") {
      const enchantLevel = Number.parseInt(filters.enchantFilter ?? "", 10);
      result = result.filter((item) => {
        const itemEnchantLevel = item.itemId.match(/@([0-3])$/)?.[1];
        return itemEnchantLevel
          ? Number.parseInt(itemEnchantLevel, 10) === enchantLevel
          : enchantLevel === 0;
      });
    }

    if (minPriceNumber !== null && !hasInvalidPriceRange) {
      result = result.filter((item) => item.sellPrice >= minPriceNumber);
    }

    if (maxPriceNumber !== null && !hasInvalidPriceRange) {
      result = result.filter((item) => item.sellPrice <= maxPriceNumber);
    }

    if (minSpreadNumber !== null && !hasInvalidSpreadRange) {
      result = result.filter((item) => item.spreadPercent >= minSpreadNumber);
    }

    if (maxSpreadNumber !== null && !hasInvalidSpreadRange) {
      result = result.filter((item) => item.spreadPercent <= maxSpreadNumber);
    }

    return result;
  }, [
    filters,
    items,
    hasInvalidPriceRange,
    hasInvalidSpreadRange,
    maxPriceNumber,
    maxSpreadNumber,
    minPriceNumber,
    minSpreadNumber,
  ]);

  const clearAllFilters = () => {
    isClearingRef.current = true;
    setFilters(defaultFilters);
    filterStorage.clearFilters();

    setTimeout(() => {
      isClearingRef.current = false;
    }, 0);
  };

  return {
    filters,
    filteredItems,
    hasInvalidPriceRange,
    hasInvalidSpreadRange,
    hasActiveFilters: getHasActiveFilters(filters),
    activeFilterCount: [
      filters.categoryFilter !== "all",
      filters.cityFilter !== "all",
      filters.tierFilter !== "all",
      filters.qualityFilter !== "all",
      filters.enchantFilter !== "all",
      filters.minPrice,
      filters.maxPrice,
      filters.minSpread,
      filters.maxSpread,
    ].filter(Boolean).length,
    setSearch: (search: string) => setFilters((prev) => ({ ...prev, search })),
    setCategoryFilter: (categoryFilter: CatalogCategoryKey | "all") =>
      setFilters((prev) => ({ ...prev, categoryFilter })),
    setCityFilter: (cityFilter: string) =>
      setFilters((prev) => ({ ...prev, cityFilter })),
    setTierFilter: (tierFilter: string) =>
      setFilters((prev) => ({ ...prev, tierFilter })),
    setQualityFilter: (qualityFilter: string) =>
      setFilters((prev) => ({ ...prev, qualityFilter })),
    setEnchantFilter: (enchantFilter: string) =>
      setFilters((prev) => ({ ...prev, enchantFilter })),
    setMinPrice: (minPrice: string) =>
      setFilters((prev) => ({ ...prev, minPrice })),
    setMaxPrice: (maxPrice: string) =>
      setFilters((prev) => ({ ...prev, maxPrice })),
    setMinSpread: (minSpread: string) =>
      setFilters((prev) => ({ ...prev, minSpread })),
    setMaxSpread: (maxSpread: string) =>
      setFilters((prev) => ({ ...prev, maxSpread })),
    clearAllFilters,
  };
}
