import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services';

interface UseLastUpdateTimeOptions {
  refetchInterval?: number | false;
}

export function useLastUpdateTime(options: UseLastUpdateTimeOptions = {}) {
  return useQuery({
    queryKey: ['lastUpdateTime'],
    queryFn: () => marketService.getLastUpdateTime(),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
}
