import { useState, useMemo } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { MarketItem } from '@/data/types';
import { cities, tiers, qualities } from '@/data/constants';
import { Sparkline } from '@/components/ui/sparkline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PriceTableProps {
  items: MarketItem[];
  className?: string;
}

type SortField = 'itemName' | 'city' | 'sellPrice' | 'buyPrice' | 'spread' | 'spreadPercent' | 'timestamp';
type SortDirection = 'asc' | 'desc';

export function PriceTable({ items, className }: PriceTableProps) {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('spreadPercent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        item => 
          item.itemName.toLowerCase().includes(searchLower) ||
          item.itemId.toLowerCase().includes(searchLower)
      );
    }

    if (cityFilter !== 'all') {
      result = result.filter(item => item.city === cityFilter);
    }

    if (tierFilter !== 'all') {
      result = result.filter(item => item.tier === tierFilter);
    }

    if (qualityFilter !== 'all') {
      result = result.filter(item => item.quality === qualityFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [items, search, cityFilter, tierFilter, qualityFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-primary" />
      : <ArrowDown className="h-3 w-3 text-primary" />;
  };

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
              onChange={(e) => setSearch(e.target.value)}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left p-3">
                <button 
                  onClick={() => handleSort('itemName')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Item <SortIcon field="itemName" />
                </button>
              </th>
              <th className="text-left p-3">
                <button 
                  onClick={() => handleSort('city')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  City <SortIcon field="city" />
                </button>
              </th>
              <th className="text-right p-3">
                <button 
                  onClick={() => handleSort('sellPrice')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Sell Price <SortIcon field="sellPrice" />
                </button>
              </th>
              <th className="text-right p-3">
                <button 
                  onClick={() => handleSort('buyPrice')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Buy Price <SortIcon field="buyPrice" />
                </button>
              </th>
              <th className="text-right p-3">
                <button 
                  onClick={() => handleSort('spreadPercent')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Spread <SortIcon field="spreadPercent" />
                </button>
              </th>
              <th className="text-center p-3 hidden md:table-cell">
                <span className="text-xs font-semibold text-muted-foreground">Trend</span>
              </th>
              <th className="text-right p-3">
                <button 
                  onClick={() => handleSort('timestamp')}
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
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
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
                        <p className="font-medium text-sm text-foreground">{item.itemName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            {item.tier}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.quality}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-muted-foreground">{item.city}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm text-foreground">{formatPrice(item.sellPrice)}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm text-foreground">{formatPrice(item.buyPrice)}</span>
                  </td>
                  <td className="p-3 text-right">
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
                  <td className="p-3 hidden md:table-cell">
                    <div className="flex justify-center">
                      <Sparkline data={item.priceHistory} />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-xs text-muted-foreground">{formatTime(item.timestamp)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-8 h-8 p-0',
                      currentPage === page && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
