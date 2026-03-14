import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TopItemsPanel } from '@/components/dashboard/TopItemsPanel';
import { PriceTable } from '@/components/dashboard/PriceTable';
import { useMarketItems } from '@/hooks/useMarketItems';
import { useTopProfitable } from '@/hooks/useTopProfitable';
import { useLastUpdateTime } from '@/hooks/useLastUpdateTime';
import { TrendingUp, LayoutDashboard, Zap, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items = [], isLoading: itemsLoading } = useMarketItems();
  const { data: topItems = [], isLoading: topLoading } = useTopProfitable(5);
  const { data: lastUpdate, isLoading: timeLoading } = useLastUpdateTime();

  const isRefreshing = itemsLoading || topLoading || timeLoading;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['marketItems'] });
    queryClient.invalidateQueries({ queryKey: ['topProfitable'] });
    queryClient.invalidateQueries({ queryKey: ['lastUpdateTime'] });
    toast({
      title: 'Data refreshed',
      description: 'Market prices have been updated.',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-primary/30"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
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
            title="Avg. Spread"
            value="18.5%"
            subtitle="Profit margin"
            icon={Zap}
            trend={{ value: 2.3, isPositive: true }}
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
          {/* Top Items Sidebar */}
          <div className="xl:col-span-1">
            {topLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <TopItemsPanel items={topItems} />
            )}
          </div>

          {/* Price Table */}
          <div className="xl:col-span-3">
            {itemsLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <PriceTable items={items} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
