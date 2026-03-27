import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';

export function NavbarAuthSection() {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground truncate max-w-[160px]">
          {user.email}
        </Link>
        <Button variant="ghost" size="sm" onClick={() => void signOut()}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login">Sign In</Link>
      </Button>
      <Button size="sm" className="bg-gold-gradient text-primary-foreground hover:opacity-90 gold-glow" asChild>
        <Link to="/login">Get Started</Link>
      </Button>
    </div>
  );
}
