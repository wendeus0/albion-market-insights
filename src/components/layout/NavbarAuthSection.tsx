import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';

interface NavbarAuthSectionProps {
  onNavigate?: () => void;
}

export function NavbarAuthSection({ onNavigate }: NavbarAuthSectionProps) {
  const { user, signOut } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          onClick={onNavigate}
          className="text-sm text-muted-foreground hover:text-foreground truncate max-w-[160px]"
        >
          {user.email}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void signOut().catch(() => {
              toast.error('Unable to sign out', {
                description: 'Please try again in a moment.',
              });
            });
          }}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login" onClick={onNavigate}>Sign In</Link>
      </Button>
      <Button size="sm" className="bg-gold-gradient text-primary-foreground hover:opacity-90 gold-glow" asChild>
        <Link to="/login" onClick={onNavigate}>Get Started</Link>
      </Button>
    </div>
  );
}
