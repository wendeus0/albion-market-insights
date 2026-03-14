import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services';

export function useLastUpdateTime() {
  return useQuery({
    queryKey: ['lastUpdateTime'],
    queryFn: () => marketService.getLastUpdateTime(),
    staleTime: 15 * 60 * 1000,
  });
}
