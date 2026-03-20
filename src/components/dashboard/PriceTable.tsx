import { useEffect } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { MarketItem } from "@/data/types";
import {
  cities,
  tiers,
  qualities,
  ITEM_CATALOG,
  ENCHANTMENT_LEVELS,
} from "@/data/constants";
import type { CatalogCategoryKey } from "@/data/constants";
import { Sparkline } from "@/components/ui/sparkline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePriceTableFilters } from "@/hooks/usePriceTableFilters";
import { usePriceTablePagination } from "@/hooks/usePriceTablePagination";
import { usePriceTableSort, type SortField } from "@/hooks/usePriceTableSort";
import { cn } from "@/lib/utils";

interface PriceTableProps {
  items: MarketItem[];
  className?: string;
}

export function PriceTable({ items, className }: PriceTableProps) {
  const itemsPerPage = 10;
  const {
    filters,
    filteredItems,
    hasActiveFilters,
    activeFilterCount,
    setSearch,
    setCategoryFilter,
    setCityFilter,
    setTierFilter,
    setQualityFilter,
    setEnchantFilter,
    setMinPrice,
    setMaxPrice,
    setMinSpread,
    setMaxSpread,
    clearAllFilters,
  } = usePriceTableFilters(items);
  const { sortField, sortDirection, sortedItems, handleSort } =
    usePriceTableSort(filteredItems);
  const {
    currentPage,
    totalPages,
    paginatedItems,
    visiblePages,
    setCurrentPage,
    goToPreviousPage,
    goToNextPage,
  } = usePriceTablePagination(sortedItems, itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.search,
    filters.categoryFilter,
    filters.cityFilter,
    filters.tierFilter,
    filters.qualityFilter,
    filters.enchantFilter,
    filters.minPrice,
    filters.maxPrice,
    filters.minSpread,
    filters.maxSpread,
    setCurrentPage,
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US").format(price);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      <div className="p-4 border-b border-border/50">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name or ID..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-border/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.categoryFilter}
              onValueChange={(value) =>
                setCategoryFilter(value as CatalogCategoryKey | "all")
              }
            >
              <SelectTrigger
                className="w-[150px] bg-muted/50 border-border/50"
                aria-label="Category"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(
                  Object.entries(ITEM_CATALOG) as [
                    CatalogCategoryKey,
                    { label: string },
                  ][]
                ).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger
                className="w-[140px] bg-muted/50 border-border/50"
                aria-label="City"
              >
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[100px] bg-muted/50 border-border/50">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {tiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.qualityFilter}
              onValueChange={setQualityFilter}
            >
              <SelectTrigger className="w-[130px] bg-muted/50 border-border/50">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualities</SelectItem>
                {qualities.map((quality) => (
                  <SelectItem key={quality} value={quality}>
                    {quality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.enchantFilter}
              onValueChange={setEnchantFilter}
            >
              <SelectTrigger className="w-[130px] bg-muted/50 border-border/50">
                <SelectValue placeholder="Enchantment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {ENCHANTMENT_LEVELS.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    {level === 0 ? "No Enchant" : `Level ${level}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-[100px] bg-muted/50 border-border/50"
              />
              <Input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-[100px] bg-muted/50 border-border/50"
              />
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min spread %"
                value={filters.minSpread}
                onChange={(e) => setMinSpread(e.target.value)}
                className="w-[100px] bg-muted/50 border-border/50"
              />
              <Input
                type="number"
                placeholder="Max spread %"
                value={filters.maxSpread}
                onChange={(e) => setMaxSpread(e.target.value)}
                className="w-[100px] bg-muted/50 border-border/50"
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="border-border/50"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">
              {activeFilterCount} filter active
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left p-3">
                <button
                  onClick={() => handleSort("itemName")}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Item <SortIcon field="itemName" />
                </button>
              </th>
              <th className="text-left p-3">
                <button
                  onClick={() => handleSort("city")}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  City <SortIcon field="city" />
                </button>
              </th>
              <th className="text-right p-3">
                <button
                  onClick={() => handleSort("sellPrice")}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Sell Price <SortIcon field="sellPrice" />
                </button>
              </th>
              <th className="text-right p-3">
                <button
                  onClick={() => handleSort("buyPrice")}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Buy Price <SortIcon field="buyPrice" />
                </button>
              </th>
              <th className="text-right p-3">
                <button
                  onClick={() => handleSort("spreadPercent")}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Spread <SortIcon field="spreadPercent" />
                </button>
              </th>
              <th className="text-center p-3 hidden md:table-cell">
                <span className="text-xs font-semibold text-muted-foreground">
                  Trend
                </span>
              </th>
              <th className="text-right p-3">
                <button
                  onClick={() => handleSort("timestamp")}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Updated <SortIcon field="timestamp" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-50" />
                    <p>No items found matching your criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, index) => (
                <tr
                  key={item.itemId + index}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {item.itemName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {item.tier}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-muted-foreground">
                      {item.city}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm text-foreground">
                      {formatPrice(item.sellPrice)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm text-foreground">
                      {formatPrice(item.buyPrice)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          "font-mono text-sm font-semibold",
                          item.spreadPercent > 20
                            ? "text-success"
                            : item.spreadPercent > 10
                              ? "text-primary"
                              : "text-muted-foreground",
                        )}
                      >
                        +{item.spreadPercent.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatPrice(item.spread)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <div className="flex justify-center">
                      <Sparkline data={item.priceHistory} />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(item.timestamp)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedItems.length)} of{" "}
            {sortedItems.length} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {visiblePages.map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 p-0",
                    currentPage === page &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
