import { useMemo, useRef, useTransition } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
} from 'lucide-react';
import { MarketItem, cities, tiers, qualities } from '@/data/mockData';
import { Sparkline } from '@/components/ui/sparkline';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMarketFilters, type SortField } from '@/store/marketFilters';

interface PriceTableProps {
  items: MarketItem[];
  className?: string;
}

const formatPrice = (price: number) => new Intl.NumberFormat('en-US').format(price)

const formatTime = (timestamp: string) => {
  const diffMinutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  return `${Math.floor(diffMinutes / 60)}h ago`
}

function SortIcon({ field }: { field: SortField }) {
  const { sortField, sortDirection } = useMarketFilters()
  if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />
  return sortDirection === 'asc'
    ? <ArrowUp className="h-3 w-3 text-primary" />
    : <ArrowDown className="h-3 w-3 text-primary" />
}

const ROW_HEIGHT = 57

export function PriceTable({ items, className }: PriceTableProps) {
  const {
    search, cityFilter, tierFilter, qualityFilter,
    sortField, sortDirection,
    setSearch, setCityFilter, setTierFilter, setQualityFilter,
    handleSort,
  } = useMarketFilters()

  const [, startTransition] = useTransition()
  const parentRef = useRef<HTMLDivElement>(null)

  const filteredAndSortedItems = useMemo(() => {
    const searchLower = search.toLowerCase()

    const filtered = items.filter(item => {
      if (search && !item.itemName.toLowerCase().includes(searchLower) && !item.itemId.toLowerCase().includes(searchLower)) return false
      if (cityFilter !== 'all' && item.city !== cityFilter) return false
      if (tierFilter !== 'all' && item.tier !== tierFilter) return false
      if (qualityFilter !== 'all' && item.quality !== qualityFilter) return false
      return true
    })

    return filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
  }, [items, search, cityFilter, tierFilter, qualityFilter, sortField, sortDirection])

  const virtualizer = useVirtualizer({
    count: filteredAndSortedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      {/* Filters Bar */}
      <div className="p-4 border-b border-border/50">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name or ID..."
              value={search}
              onChange={(e) => startTransition(() => setSearch(e.target.value))}
              className="pl-9 bg-muted/50 border-border/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[140px] bg-muted/50 border-border/50">
                <Filter className="h-3 w-3 mr-2" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[100px] bg-muted/50 border-border/50">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                {tiers.map(tier => (
                  <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-[130px] bg-muted/50 border-border/50">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualities</SelectItem>
                {qualities.map(quality => (
                  <SelectItem key={quality} value={quality}>{quality}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left p-3">
                <button onClick={() => handleSort('itemName')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  Item <SortIcon field="itemName" />
                </button>
              </th>
              <th className="text-left p-3">
                <button onClick={() => handleSort('city')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  City <SortIcon field="city" />
                </button>
              </th>
              <th className="text-right p-3">
                <button onClick={() => handleSort('sellPrice')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  Sell Price <SortIcon field="sellPrice" />
                </button>
              </th>
              <th className="text-right p-3">
                <button onClick={() => handleSort('buyPrice')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  Buy Price <SortIcon field="buyPrice" />
                </button>
              </th>
              <th className="text-right p-3">
                <button onClick={() => handleSort('spreadPercent')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  Spread <SortIcon field="spreadPercent" />
                </button>
              </th>
              <th className="text-center p-3 hidden md:table-cell">
                <span className="text-xs font-semibold text-muted-foreground">Trend</span>
              </th>
              <th className="text-right p-3">
                <button onClick={() => handleSort('timestamp')} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  Updated <SortIcon field="timestamp" />
                </button>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtual Rows */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: Math.min(filteredAndSortedItems.length * ROW_HEIGHT, 570) }}
      >
        {filteredAndSortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Search className="h-8 w-8 opacity-50" />
            <p>No items found matching your criteria</p>
          </div>
        ) : (
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const item = filteredAndSortedItems[virtualRow.index]
              return (
                <div
                  key={item.itemId}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start,
                    left: 0,
                    width: '100%',
                    height: ROW_HEIGHT,
                  }}
                >
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-3" style={{ width: '25%' }}>
                          <div>
                            <p className="font-medium text-sm text-foreground">{item.itemName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                {item.tier}
                              </span>
                              <span className="text-xs text-muted-foreground">{item.quality}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3" style={{ width: '15%' }}>
                          <span className="text-sm text-muted-foreground">{item.city}</span>
                        </td>
                        <td className="p-3 text-right" style={{ width: '15%' }}>
                          <span className="font-mono text-sm text-foreground">{formatPrice(item.sellPrice)}</span>
                        </td>
                        <td className="p-3 text-right" style={{ width: '15%' }}>
                          <span className="font-mono text-sm text-foreground">{formatPrice(item.buyPrice)}</span>
                        </td>
                        <td className="p-3 text-right" style={{ width: '15%' }}>
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              'font-mono text-sm font-semibold',
                              item.spreadPercent > 20 ? 'text-success' :
                              item.spreadPercent > 10 ? 'text-primary' : 'text-muted-foreground'
                            )}>
                              +{item.spreadPercent.toFixed(1)}%
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatPrice(item.spread)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell" style={{ width: '10%' }}>
                          <div className="flex justify-center">
                            <Sparkline data={item.priceHistory} />
                          </div>
                        </td>
                        <td className="p-3 text-right" style={{ width: '10%' }}>
                          <span className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Count Footer */}
      <div className="p-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          {filteredAndSortedItems.length} of {items.length} items
        </p>
      </div>
    </div>
  );
}
