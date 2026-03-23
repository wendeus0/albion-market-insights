import { useMemo } from "react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ArbitrageTable } from "@/components/dashboard/ArbitrageTable";
import { TopArbitragePanel } from "@/components/dashboard/TopArbitragePanel";
import { DataSourceBadge } from "@/components/dashboard/DataSourceBadge";
import { DegradedBanner } from "@/components/dashboard/DegradedBanner";
import { useMarketItems } from "@/hooks/useMarketItems";
import { useLastUpdateTime } from "@/hooks/useLastUpdateTime";
import { TrendingUp, LayoutDashboard, Zap, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { buildCrossCityArbitrage } from "@/lib/arbitrage";
import { DATA_FRESHNESS_MS } from "@/data/constants";

function getRelativeUpdateLabel(lastUpdate: string | null, isRefreshing: boolean): string {
  if (isRefreshing) return "Syncing...";
  if (!lastUpdate) return "Awaiting first sync";

  const timestamp = new Date(lastUpdate).getTime();
  if (Number.isNaN(timestamp)) return "Awaiting first sync";

  const elapsedMs = Date.now() - timestamp;
  if (elapsedMs < 60_000) return "Updated just now";

  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  if (elapsedMinutes < 60) return `Updated ${elapsedMinutes} min ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return `Updated ${elapsedHours}h ago`;
}

const Dashboard = () => {
  const { data: items = [], isLoading: itemsLoading } = useMarketItems({
    refetchInterval: DATA_FRESHNESS_MS,
  });
  const { data: lastUpdate, isLoading: timeLoading } = useLastUpdateTime({
    refetchInterval: DATA_FRESHNESS_MS,
  });

  const arbitrageItems = useMemo(() => buildCrossCityArbitrage(items), [items]);

  const isRefreshing = itemsLoading || timeLoading;
  const updateStatusLabel = getRelativeUpdateLabel(lastUpdate ?? null, isRefreshing);
  const avgRoi =
    arbitrageItems.length > 0
      ? `${(arbitrageItems.reduce((sum, item) => sum + item.netProfitPercent, 0) / arbitrageItems.length).toFixed(1)}%`
      : "0.0%";

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Degraded Banner */}
      <DegradedBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Market Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time price data across all Albion Online cities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge />
          <span
            className="text-sm text-muted-foreground"
            aria-live="polite"
            data-testid="auto-refresh-status"
          >
            {updateStatusLabel}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Items"
          value={itemsLoading ? "..." : items.length}
          subtitle="Across all cities"
          icon={TrendingUp}
        />
        <StatsCard
          title="Cities"
          value="7"
          subtitle="Including Black Market"
          icon={LayoutDashboard}
        />
        <StatsCard
          title="Avg. ROI"
          value={itemsLoading ? "..." : avgRoi}
          subtitle="Net return after tax"
          icon={Zap}
        />
        <StatsCard
          title="Last Update"
          value={timeLoading || !lastUpdate ? "..." : formatTime(lastUpdate)}
          subtitle="Every 15 min"
          icon={Clock}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1">
          {itemsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <TopArbitragePanel items={arbitrageItems} />
          )}
        </div>

        <div className="xl:col-span-3">
          <h2 className="text-lg font-semibold mb-4">
            Cross-City Arbitrage Opportunities
          </h2>
          {itemsLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <ArbitrageTable items={arbitrageItems} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
