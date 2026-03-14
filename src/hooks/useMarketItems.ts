import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services';

export function useMarketItems() {
  return useQuery({
    queryKey: ['marketItems'],
    queryFn: () => marketService.getItems(),
    staleTime: 15 * 60 * 1000,
  });
}
