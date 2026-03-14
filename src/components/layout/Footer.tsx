import { TrendingUp, Github, Mail, Shield } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gold-gradient flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Albion Market Tracker</h3>
                <p className="text-xs text-muted-foreground">Real-time market intelligence</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Track Albion Online market prices, analyze profit margins, and set up alerts 
              for your favorite items. Make informed trading decisions with real-time data.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Price Alerts
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Shield className="h-4 w-4" />
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © 2024 Albion Market Tracker. This is a fan-made tool and is not affiliated with Sandbox Interactive.
          </p>
          <p className="text-xs text-muted-foreground">
            Albion Online is a registered trademark of Sandbox Interactive GmbH.
          </p>
        </div>
      </div>
    </footer>
  );
}
