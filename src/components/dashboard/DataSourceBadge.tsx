import { useDataSource } from '@/hooks/useDataSource';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export function DataSourceBadge() {
  const { status, isReal, isDegraded, getLabel, getDescription } = useDataSource();

  const getIcon = () => {
    if (isReal) return <Wifi className="h-3 w-3 mr-1" />;
    if (isDegraded) return <AlertTriangle className="h-3 w-3 mr-1" />;
    return <WifiOff className="h-3 w-3 mr-1" />;
  };

  const getVariant = () => {
    if (isReal) return 'default';
    if (isDegraded) return 'destructive';
    return 'secondary';
  };

  const getBadgeColor = () => {
    if (isReal) return 'bg-emerald-500 hover:bg-emerald-600';
    if (isDegraded) return 'bg-red-500 hover:bg-red-600';
    return 'bg-amber-500 hover:bg-amber-600';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getVariant()}
            className={`cursor-help ${getBadgeColor()} text-white`}
          >
            {getIcon()}
            {getLabel()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Fonte de Dados: {getLabel()}</p>
            <p className="text-sm text-muted-foreground">{getDescription()}</p>
            {status.lastError && (
              <p className="text-sm text-destructive">Erro: {status.lastError}</p>
            )}
            {status.lastSuccessfulFetch && isReal && (
              <p className="text-xs text-muted-foreground">
                Última atualização: {status.lastSuccessfulFetch.toLocaleTimeString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

