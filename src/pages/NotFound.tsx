import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-display font-bold gradient-text mb-4">404</h1>
          <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md">
            Looks like this trade route leads nowhere. Let's get you back to the marketplace.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="bg-gold-gradient text-primary-foreground">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-primary/30">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
