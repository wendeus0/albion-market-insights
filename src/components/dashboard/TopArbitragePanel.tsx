import { ArrowUpRight, Route, ShoppingCart } from 'lucide-react';
import type { ArbitrageOpportunity } from '@/data/types';
import { cn } from '@/lib/utils';

interface TopArbitragePanelProps {
  items: ArbitrageOpportunity[];
  className?: string;
}

export function TopArbitragePanel({ items, className }: TopArbitragePanelProps) {
  const formatPrice = (price: number) => new Intl.NumberFormat('en-US').format(price);

  return (
    <div className={cn('glass-card p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
            <Route className="h-4 w-4 text-success" />
          </div>
          <h3 className="font-semibold text-foreground">Top Arbitrage Routes</h3>
        </div>
        <span className="text-xs text-muted-foreground">Net ROI</span>
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map((item, index) => (
          <div
            key={`${item.itemId}|${item.quality}|${item.buyCity}|${item.sellCity}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
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

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <ShoppingCart className="h-3 w-3" />
                <span>{item.buyCity} → {item.sellCity}</span>
              </div>

              <div className="text-xs text-muted-foreground font-mono mt-1">
                {formatPrice(item.buyPrice)} → {formatPrice(item.sellPrice)}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-success">+{item.netProfitPercent.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground font-mono">{formatPrice(item.netProfit)}</p>
            </div>

            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
