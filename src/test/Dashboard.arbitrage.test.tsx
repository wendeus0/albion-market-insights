import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '@/pages/Dashboard';
import type { MarketItem } from '@/data/types';

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

const mockItems: MarketItem[] = [
  {
    itemId: 'T8_2H_HOLYSTAFF_HELL@3',
    itemName: 'Great Holy Staff T8 .3',
    city: 'Martlock',
    sellPrice: 5_900_000,
    buyPrice: 1,
    spread: 5_899_999,
    spreadPercent: 589999900,
    timestamp: '2026-03-17T10:00:00.000Z',
    tier: 'T8',
    quality: 'Good',
    priceHistory: [5_700_000, 5_800_000, 5_900_000],
  },
  {
    itemId: 'T8_2H_HOLYSTAFF_HELL@3',
    itemName: 'Great Holy Staff T8 .3',
    city: 'Caerleon',
    sellPrice: 7_500_000,
    buyPrice: 7_200_000,
    spread: 300_000,
    spreadPercent: 4.16,
    timestamp: '2026-03-17T10:00:00.000Z',
    tier: 'T8',
    quality: 'Good',
    priceHistory: [7_200_000, 7_300_000, 7_500_000],
  },
  {
    itemId: 'T6_MAIN_AXE',
    itemName: 'Battleaxe T6',
    city: 'Lymhurst',
    sellPrice: 12_000,
    buyPrice: 10_000,
    spread: 2_000,
    spreadPercent: 20,
    timestamp: '2026-03-17T10:00:00.000Z',
    tier: 'T6',
    quality: 'Normal',
    priceHistory: [],
  },
];

vi.mock('@/hooks/useMarketItems', () => ({
  useMarketItems: () => ({
    data: mockItems,
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useLastUpdateTime', () => ({
  useLastUpdateTime: () => ({
    data: '2026-03-17T10:00:00.000Z',
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useRefreshCooldown', () => ({
  useRefreshCooldown: () => ({
    canRefresh: true,
    formattedTime: '0:00',
    recordRefresh: vi.fn(),
    refreshState: {
      canRefresh: true,
      timeRemaining: 0,
      lastRefresh: null,
    },
  }),
}));

describe('Dashboard — Cross-City Arbitrage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir título de arbitragem cross-city', () => {
    render(<Dashboard />);

    expect(screen.getByText('Cross-City Arbitrage Opportunities')).toBeInTheDocument();
  });

  it('deve exibir oportunidades de arbitragem na tabela', () => {
    render(<Dashboard />);

    expect(screen.getAllByText('Great Holy Staff T8 .3')).toHaveLength(2);
    expect(screen.getAllByText('Martlock').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Caerleon').length).toBeGreaterThan(0);
  });

  it('deve exibir estatísticas de arbitragem no painel lateral', () => {
    render(<Dashboard />);

    // O painel lateral deve mostrar oportunidades de arbitragem
    expect(screen.getByText(/martlock → caerleon/i)).toBeInTheDocument();
  });

  it('deve calcular e exibir ROI médio', () => {
    render(<Dashboard />);

    expect(screen.getByText('Avg. ROI')).toBeInTheDocument();
  });
});

