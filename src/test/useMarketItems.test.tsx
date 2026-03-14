import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useMarketItems } from '@/hooks/useMarketItems';
import type { MarketItem } from '@/data/types';

const mockItems: MarketItem[] = [
  {
    itemId: 'ITEM_0001',
    itemName: 'Clarent Blade',
    city: 'Caerleon',
    sellPrice: 50000,
    buyPrice: 40000,
    spread: 10000,
    spreadPercent: 25,
    timestamp: new Date().toISOString(),
    tier: 'T4',
    quality: 'Normal',
    priceHistory: [45000, 46000, 47000, 48000, 49000, 50000, 51000],
  },
];

vi.mock('@/services', () => ({
  marketService: {
    getItems: vi.fn().mockResolvedValue([
      {
        itemId: 'ITEM_0001',
        itemName: 'Clarent Blade',
        city: 'Caerleon',
        sellPrice: 50000,
        buyPrice: 40000,
        spread: 10000,
        spreadPercent: 25,
        timestamp: new Date().toISOString(),
        tier: 'T4',
        quality: 'Normal',
        priceHistory: [45000, 46000, 47000, 48000, 49000, 50000, 51000],
      },
    ]),
    getTopProfitable: vi.fn().mockResolvedValue([]),
    getLastUpdateTime: vi.fn().mockResolvedValue(new Date().toISOString()),
    getAlerts: vi.fn().mockResolvedValue([]),
    saveAlert: vi.fn().mockResolvedValue(undefined),
    deleteAlert: vi.fn().mockResolvedValue(undefined),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useMarketItems', () => {
  it('começa em estado de loading', () => {
    const { result } = renderHook(() => useMarketItems(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('retorna dados após resolver', async () => {
    const { result } = renderHook(() => useMarketItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].itemId).toBe('ITEM_0001');
  });

  it('expõe data, isLoading e error', async () => {
    const { result } = renderHook(() => useMarketItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
  });

  it('data é array de MarketItem com campos corretos', async () => {
    const { result } = renderHook(() => useMarketItems(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const item = result.current.data![0];
    expect(item).toHaveProperty('itemId');
    expect(item).toHaveProperty('itemName');
    expect(item).toHaveProperty('spreadPercent');
    expect(item).toHaveProperty('priceHistory');
  });
});
