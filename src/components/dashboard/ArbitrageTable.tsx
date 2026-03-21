import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { ArbitrageOpportunity } from '@/data/types';
import { Input } from '@/components/ui/input';
import { ItemIcon } from '@/components/items/ItemIcon';
import { cn } from '@/lib/utils';

interface ArbitrageTableProps {
  items: ArbitrageOpportunity[];
  className?: string;
}

type SortField = 'itemName' | 'buyCity' | 'sellCity' | 'buyPrice' | 'sellPrice' | 'netProfit' | 'netProfitPercent' | 'timestamp';
type SortDirection = 'asc' | 'desc';

export function ArbitrageTable({ items, className }: ArbitrageTableProps) {
  const [search, setSearch] = useState('');
  const [minNetProfit, setMinNetProfit] = useState('');
  const [minRoi, setMinRoi] = useState('');
  const [sortField, setSortField] = useState<SortField>('netProfitPercent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase();
    const minNetProfitValue = minNetProfit ? Number(minNetProfit) : null;
    const minRoiValue = minRoi ? Number(minRoi) : null;

    const result = items.filter(item => {
      const matchesSearch = !searchLower || (
        item.itemName.toLowerCase().includes(searchLower) ||
        item.itemId.toLowerCase().includes(searchLower) ||
        item.buyCity.toLowerCase().includes(searchLower) ||
        item.sellCity.toLowerCase().includes(searchLower)
      );

      const matchesNetProfit = minNetProfitValue === null || item.netProfit >= minNetProfitValue;
      const matchesRoi = minRoiValue === null || item.netProfitPercent >= minRoiValue;

      return matchesSearch && matchesNetProfit && matchesRoi;
    });

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });

    return result;
  }, [items, minNetProfit, minRoi, search, sortDirection, sortField]);

  const minNetProfitValue = minNetProfit ? Number(minNetProfit) : null;
  const minRoiValue = minRoi ? Number(minRoi) : null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortField(field);
    setSortDirection('desc');
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, filteredItems],
  );

  const visiblePages = useMemo(() => {
    if (totalPages === 0) return [];

    return Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
      if (totalPages <= 5) return index + 1;
      if (currentPage <= 3) return index + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + index;
      return currentPage - 2 + index;
    });
  }, [currentPage, totalPages]);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US').format(price);

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
      <div className="p-4 border-b border-border/50">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search item, buy city or sell city..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-muted/50 border-border/50"
            />
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min net profit"
              value={minNetProfit}
              onChange={(event) => {
                setMinNetProfit(event.target.value);
                setCurrentPage(1);
              }}
              className="w-[140px] bg-muted/50 border-border/50"
            />
            <Input
              type="number"
              placeholder="Min ROI"
              value={minRoi}
              onChange={(event) => {
                setMinRoi(event.target.value);
                setCurrentPage(1);
              }}
              className="w-[110px] bg-muted/50 border-border/50"
            />
          </div>
        </div>
      </div>

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
                  onClick={() => handleSort('buyCity')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Buy In <SortIcon field="buyCity" />
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
              <th className="text-left p-3">
                <button
                  onClick={() => handleSort('sellCity')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sell In <SortIcon field="sellCity" />
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
                  onClick={() => handleSort('netProfit')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Net Profit <SortIcon field="netProfit" />
                </button>
              </th>
              <th className="text-right p-3">
                <button
                  onClick={() => handleSort('netProfitPercent')}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  ROI <SortIcon field="netProfitPercent" />
                </button>
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
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-50" />
                    <p>No arbitrage opportunities found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map(item => (
                <tr
                  key={`${item.itemId}|${item.quality}|${item.buyCity}|${item.sellCity}`}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <ItemIcon itemId={item.itemId} itemName={item.itemName} />
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
                  <td className="p-3 text-sm text-muted-foreground">{item.buyCity}</td>
                  <td className="p-3 text-right font-mono text-sm text-foreground">{formatPrice(item.buyPrice)}</td>
                  <td className="p-3 text-sm text-muted-foreground">{item.sellCity}</td>
                  <td className="p-3 text-right font-mono text-sm text-foreground">{formatPrice(item.sellPrice)}</td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm font-semibold text-success">{formatPrice(item.netProfit)}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-mono text-sm font-semibold text-success">+{item.netProfitPercent.toFixed(1)}%</span>
                  </td>
                  <td className="p-3 text-right text-xs text-muted-foreground">{formatTime(item.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} opportunities
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {visiblePages.map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn('w-8 h-8 p-0', currentPage === page && 'bg-primary text-primary-foreground')}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(Math.max(totalPages, 1), prev + 1))}
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
