import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Bell, 
  LayoutDashboard, 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock,
  ChevronRight 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TopItemsPanel } from '@/components/dashboard/TopItemsPanel';
import { PriceTable } from '@/components/dashboard/PriceTable';
import { mockItems, topProfitableItems, lastUpdateTime } from '@/data/mockData';

const Index = () => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Data',
      description: 'Prices updated every 15 minutes from all major cities.',
    },
    {
      icon: Shield,
      title: 'Smart Alerts',
      description: 'Set custom price alerts and never miss a trading opportunity.',
    },
    {
      icon: Clock,
      title: 'Price History',
      description: 'Track price trends and make informed trading decisions.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 py-20 lg:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm text-primary font-medium">Live Market Data</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 animate-slide-up">
              Track Albion Online{' '}
              <span className="gradient-text">Market Prices</span>{' '}
              in Real Time
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Monitor prices across all cities, analyze profit margins, and set up 
              price alerts. Make smarter trading decisions with data-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                asChild 
                size="lg" 
                className="bg-gold-gradient text-primary-foreground hover:opacity-90 gold-glow text-base px-8"
              >
                <Link to="/dashboard">
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Open Dashboard
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="text-base px-8 border-primary/30 hover:bg-primary/10"
              >
                <Link to="/alerts">
                  <Bell className="h-5 w-5 mr-2" />
                  Create Price Alert
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Items Tracked"
              value={mockItems.length}
              subtitle="Across all cities"
              icon={TrendingUp}
            />
            <StatsCard
              title="Cities Covered"
              value="7"
              subtitle="Including Black Market"
              icon={LayoutDashboard}
            />
            <StatsCard
              title="Average Spread"
              value="18.5%"
              subtitle="Profit opportunity"
              icon={Zap}
              trend={{ value: 2.3, isPositive: true }}
            />
            <StatsCard
              title="Last Update"
              value={formatTime(lastUpdateTime)}
              subtitle="Updates every 15 min"
              icon={Clock}
            />
          </div>
        </div>
      </section>

      {/* Main Dashboard Preview */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Items Panel */}
            <TopItemsPanel items={topProfitableItems} className="lg:col-span-1" />

            {/* Quick Stats */}
            <div className="lg:col-span-2 glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Market Overview</h3>
                <Link 
                  to="/dashboard" 
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View full dashboard
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time price data from all major trading cities in Albion Online. 
                Filter by tier, quality, and city to find the best trading opportunities.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-mono font-semibold text-success">+32%</p>
                  <p className="text-xs text-muted-foreground">Highest Spread</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-mono font-semibold text-foreground">1,247</p>
                  <p className="text-xs text-muted-foreground">Active Listings</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-mono font-semibold text-foreground">156K</p>
                  <p className="text-xs text-muted-foreground">Avg. Sell Price</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-mono font-semibold text-foreground">89K</p>
                  <p className="text-xs text-muted-foreground">Avg. Buy Price</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Table Preview */}
      <section className="py-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-semibold text-foreground">
                Live Market Data
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Browse all items or use filters to find specific trades
              </p>
            </div>
            <Button asChild variant="outline" className="border-primary/30">
              <Link to="/dashboard">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <PriceTable items={mockItems} />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
