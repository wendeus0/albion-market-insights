import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services';
import { DATA_FRESHNESS_MS } from '@/data/constants';

interface UseMarketItemsOptions {
  refetchInterval?: number | false;
}

export function useMarketItems(options: UseMarketItemsOptions = {}) {
  return useQuery({
    queryKey: ['marketItems'],
    queryFn: () => marketService.getItems(),
    staleTime: DATA_FRESHNESS_MS, // 15 minutos (política única de frescor)
    ...options,
  });
}
