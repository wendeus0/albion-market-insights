import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { MarketItem } from '@/data/mockData';
import { Sparkline } from '@/components/ui/sparkline';
import { cn } from '@/lib/utils';

interface TopItemsPanelProps {
  items: MarketItem[];
  className?: string;
}

export function TopItemsPanel({ items, className }: TopItemsPanelProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div className={cn('glass-card p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <h3 className="font-semibold text-foreground">Top Profitable Items</h3>
        </div>
        <span className="text-xs text-muted-foreground">Highest spread</span>
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <div
            key={item.itemId}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-foreground truncate">{item.itemName}</p>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {item.tier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{item.city}</span>
                <span>•</span>
                <span className="font-mono">{formatPrice(item.buyPrice)} → {formatPrice(item.sellPrice)}</span>
              </div>
            </div>

            <div className="hidden sm:block">
              <Sparkline data={item.priceHistory} />
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-success">
                +{item.spreadPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {formatPrice(item.spread)}
              </p>
            </div>

            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
