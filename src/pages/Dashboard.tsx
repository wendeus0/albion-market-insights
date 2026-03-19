import { useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ArbitrageTable } from '@/components/dashboard/ArbitrageTable';
import { TopArbitragePanel } from '@/components/dashboard/TopArbitragePanel';
import { DataSourceBadge } from '@/components/dashboard/DataSourceBadge';
import { DegradedBanner } from '@/components/dashboard/DegradedBanner';
import { useMarketItems } from '@/hooks/useMarketItems';
import { useLastUpdateTime } from '@/hooks/useLastUpdateTime';
import { useRefreshCooldown } from '@/hooks/useRefreshCooldown';
import { TrendingUp, LayoutDashboard, Zap, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { buildCrossCityArbitrage } from '@/lib/arbitrage';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading: itemsLoading } = useMarketItems();
  const { data: lastUpdate, isLoading: timeLoading } = useLastUpdateTime();
  const { canRefresh, formattedTime, recordRefresh } = useRefreshCooldown();

  const arbitrageItems = useMemo(() => buildCrossCityArbitrage(items), [items]);

  const isRefreshing = itemsLoading || timeLoading;
  const avgRoi = arbitrageItems.length > 0
    ? `${(arbitrageItems.reduce((sum, item) => sum + item.netProfitPercent, 0) / arbitrageItems.length).toFixed(1)}%`
    : '0.0%';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleRefresh = () => {
    if (!canRefresh) {
      toast({
        title: 'Refresh on cooldown',
        description: `Please wait ${formattedTime} before refreshing again.`,
        variant: 'destructive',
      });
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['marketItems'] });
    queryClient.invalidateQueries({ queryKey: ['lastUpdateTime'] });
    recordRefresh();
    toast({
      title: 'Data refreshed',
      description: 'Market prices have been updated.',
    });
  };

  return (
    <Layout>
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
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing || !canRefresh}
              className="border-primary/30"
              title={canRefresh ? 'Refresh data' : `Cooldown: ${formattedTime}`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {canRefresh ? 'Refresh Data' : formattedTime}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Items"
            value={itemsLoading ? '...' : items.length}
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
            value={itemsLoading ? '...' : avgRoi}
            subtitle="Net return after tax"
            icon={Zap}
          />
          <StatsCard
            title="Last Update"
            value={timeLoading || !lastUpdate ? '...' : formatTime(lastUpdate)}
            subtitle="Every 15 min"
            icon={Clock}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Top Arbitrage Sidebar */}
          <div className="xl:col-span-1">
            {itemsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <TopArbitragePanel items={arbitrageItems} />
            )}
          </div>

          {/* Arbitrage Table */}
          <div className="xl:col-span-3">
            <h2 className="text-lg font-semibold mb-4">Cross-City Arbitrage Opportunities</h2>
            {itemsLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <ArbitrageTable items={arbitrageItems} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
