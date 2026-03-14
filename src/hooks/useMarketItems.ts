import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services';

interface UseMarketItemsOptions {
  refetchInterval?: number | false;
}

export function useMarketItems(options: UseMarketItemsOptions = {}) {
  return useQuery({
    queryKey: ['marketItems'],
    queryFn: () => marketService.getItems(),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}
