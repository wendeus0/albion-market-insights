import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '@/pages/Dashboard';
import type { MarketItem } from '@/data/types';

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
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
    priceHistory: [7_000_000, 7_100_000, 7_200_000],
  },
  {
    itemId: 'T6_MAIN_AXE',
    itemName: 'Battleaxe T6',
    city: 'Bridgewatch',
    sellPrice: 100_000,
    buyPrice: 90_000,
    spread: 10_000,
    spreadPercent: 11.11,
    timestamp: '2026-03-17T10:00:00.000Z',
    tier: 'T6',
    quality: 'Normal',
    priceHistory: [95_000, 96_000, 100_000],
  },
  {
    itemId: 'T6_MAIN_AXE',
    itemName: 'Battleaxe T6',
    city: 'Thetford',
    sellPrice: 110_000,
    buyPrice: 100_000,
    spread: 10_000,
    spreadPercent: 10,
    timestamp: '2026-03-17T10:00:00.000Z',
    tier: 'T6',
    quality: 'Normal',
    priceHistory: [100_000, 105_000, 110_000],
  },
];

vi.mock('@/hooks/useMarketItems', () => ({
  useMarketItems: () => ({
    data: mockItems,
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useTopProfitable', () => ({
  useTopProfitable: () => ({
    data: [mockItems[0], mockItems[2]],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useLastUpdateTime', () => ({
  useLastUpdateTime: () => ({
    data: '2026-03-17T10:00:00.000Z',
    isLoading: false,
  }),
}));

describe('Dashboard — Cross-City Arbitrage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir alternancia entre Local Spread e Cross-City Arbitrage', () => {
    render(<Dashboard />);

    expect(screen.getByRole('button', { name: /local spread/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cross-city arbitrage/i })).toBeInTheDocument();
  });

  it('deve exibir rota de compra e venda ao ativar Cross-City Arbitrage', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByRole('button', { name: /cross-city arbitrage/i }));

    expect(screen.getAllByText('Great Holy Staff T8 .3')).toHaveLength(2);
    expect(screen.getAllByText('Martlock').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Caerleon').length).toBeGreaterThan(0);
    expect(screen.getByText(/net profit/i)).toBeInTheDocument();
  });

  it('deve calcular lucro liquido com taxa e esconder oportunidades sem lucro', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByRole('button', { name: /cross-city arbitrage/i }));

    expect(screen.getAllByText('832,000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('+14.1%').length).toBeGreaterThan(0);
    expect(screen.queryByText('Battleaxe T6')).not.toBeInTheDocument();
  });

  it('deve refletir oportunidades cross-city no painel lateral', async () => {
    const user = userEvent.setup();
    render(<Dashboard />);

    await user.click(screen.getByRole('button', { name: /cross-city arbitrage/i }));

    expect(screen.getByText(/martlock → caerleon/i)).toBeInTheDocument();
  });
});
