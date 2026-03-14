import { useQuery } from '@tanstack/react-query'
import { generateMockItems, type MarketItem } from '@/data/mockData'

async function fetchMarketItems(): Promise<MarketItem[]> {
  // Simula latência de rede — substituir pela chamada real à API Albion Online
  await new Promise((resolve) => setTimeout(resolve, 0))
  return generateMockItems(100)
}

export function useMarketItems() {
  return useQuery({
    queryKey: ['market-items'],
    queryFn: fetchMarketItems,
    staleTime: 15 * 60 * 1000,  // 15 minutos — alinhado com frequência de atualização do Albion
    gcTime: 30 * 60 * 1000,
  })
}
