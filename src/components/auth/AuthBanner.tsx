import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between gap-4 mb-4">
      <p className="text-sm text-muted-foreground">
        Seus alertas estão salvos localmente.{' '}
        <Link to="/login" className="text-primary underline underline-offset-2 hover:opacity-80">
          Faça login
        </Link>{' '}
        para sincronizar na nuvem e receber notificações no Discord.
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-6 w-6"
        onClick={() => setDismissed(true)}
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
