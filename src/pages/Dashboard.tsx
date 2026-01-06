import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TopItemsPanel } from '@/components/dashboard/TopItemsPanel';
import { PriceTable } from '@/components/dashboard/PriceTable';
import { mockItems, topProfitableItems, lastUpdateTime } from '@/data/mockData';
import { TrendingUp, LayoutDashboard, Zap, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Market prices have been updated.",
      });
    }, 1500);
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
            value={mockItems.length}
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
            value={formatTime(lastUpdateTime)}
            subtitle="Every 15 min"
            icon={Clock}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Top Items Sidebar */}
          <div className="xl:col-span-1">
            <TopItemsPanel items={topProfitableItems} />
          </div>

          {/* Price Table */}
          <div className="xl:col-span-3">
            <PriceTable items={mockItems} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
