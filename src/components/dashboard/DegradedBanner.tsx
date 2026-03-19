import { useDataSource } from '@/hooks/useDataSource';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function DegradedBanner() {
  const { isDegraded, status } = useDataSource();

  if (!isDegraded) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Dados em Modo Degradado</AlertTitle>
      <AlertDescription>
        Não foi possível conectar à API do Albion Online. 
        {status.lastError && (
          <span className="block mt-1 text-sm">Erro: {status.lastError}</span>
        )}
        <span className="block mt-2">
          Os dados exibidos podem estar desatualizados ou incompletos. 
          Tente novamente em alguns instantes.
        </span>
      </AlertDescription>
    </Alert>
  );
}

