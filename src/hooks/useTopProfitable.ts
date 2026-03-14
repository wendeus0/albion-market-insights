import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services';

export function useTopProfitable(limit = 5) {
  return useQuery({
    queryKey: ['topProfitable', limit],
    queryFn: () => marketService.getTopProfitable(limit),
    staleTime: 15 * 60 * 1000,
  });
}
