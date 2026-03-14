import { Layout } from '@/components/layout/Layout';
import { 
  Clock, 
  Database, 
  Bell, 
  TrendingUp, 
  Map, 
  MessageCircle, 
  Zap,
  CheckCircle2,
  ArrowRight 
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

const About = () => {
  const howItWorks = [
    {
      icon: Database,
      title: 'Data Collection',
      description: 'We fetch market data from the Albion Online Data Project API every 15 minutes, covering all major trading cities.',
    },
    {
      icon: TrendingUp,
      title: 'Price Aggregation',
      description: 'Prices are aggregated and analyzed to calculate spreads, profit margins, and identify the best trading opportunities.',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Set custom price alerts for specific items. Get notified instantly when prices match your criteria.',
    },
  ];

  const roadmap = [
    {
      title: 'Route Profitability Calculator',
      description: 'Calculate the most profitable trading routes between cities.',
      status: 'upcoming',
    },
    {
      title: 'Discord Notifications',
      description: 'Receive price alerts directly in your Discord server.',
      status: 'upcoming',
    },
    {
      title: 'Telegram Integration',
      description: 'Get notifications through Telegram for mobile convenience.',
      status: 'planned',
    },
    {
      title: 'Advanced Analytics',
      description: 'Historical price charts, market trends, and predictive insights.',
      status: 'planned',
    },
    {
      title: 'Guild Features',
      description: 'Share watchlists and alerts with your guild members.',
      status: 'planned',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            How It Works
          </h1>
          <p className="text-lg text-muted-foreground">
            Albion Market Tracker helps you make smarter trading decisions by providing 
            real-time market data, profit analysis, and customizable price alerts.
          </p>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={item.title} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                <div className="glass-card p-6 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gold-gradient flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Detail */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                Real-Time Market Intelligence
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">All Major Cities</p>
                    <p className="text-sm text-muted-foreground">
                      Track prices in Caerleon, Bridgewatch, Fort Sterling, Lymhurst, 
                      Martlock, Thetford, and the Black Market.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Profit Calculations</p>
                    <p className="text-sm text-muted-foreground">
                      Instantly see buy/sell spreads and identify the most profitable items.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Price Trends</p>
                    <p className="text-sm text-muted-foreground">
                      View sparkline charts showing recent price movements for each item.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Advanced Filtering</p>
                    <p className="text-sm text-muted-foreground">
                      Filter by city, tier, quality, and search by item name or ID.
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild className="mt-6 bg-gold-gradient text-primary-foreground">
                <Link to="/dashboard">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Map className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Supported Cities</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford', 'Black Market'].map(city => (
                  <div 
                    key={city}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm text-foreground">{city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Coming Next
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're constantly improving the tracker with new features. Here's what's on our roadmap.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {roadmap.map((item, index) => (
              <div 
                key={item.title}
                className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.status === 'upcoming' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Zap className={`h-5 w-5 ${
                    item.status === 'upcoming' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === 'upcoming' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {item.status === 'upcoming' ? 'Coming Soon' : 'Planned'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="glass-card p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of Albion players who use our tracker to find the best deals 
            and maximize their profits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gold-gradient text-primary-foreground gold-glow">
              <Link to="/dashboard">
                Open Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary/30">
              <Link to="/alerts">
                <Bell className="h-4 w-4 mr-2" />
                Set Up Alerts
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
