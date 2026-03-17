import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from '@/pages/Index';
import type { MarketItem } from '@/data/types';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

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
];

vi.mock('@/hooks/useMarketItems', () => ({
  useMarketItems: () => ({ data: mockItems }),
}));

vi.mock('@/hooks/useTopProfitable', () => ({
  useTopProfitable: () => ({ data: [mockItems[0]] }),
}));

vi.mock('@/hooks/useLastUpdateTime', () => ({
  useLastUpdateTime: () => ({ data: '2026-03-17T10:00:00.000Z' }),
}));

describe('Index — arbitrage preview', () => {
  it('deve exibir painel de arbitragem no preview principal', () => {
    render(<Index />);

    expect(screen.getByText(/top arbitrage routes/i)).toBeInTheDocument();
  });

  it('deve exibir preview da tabela com rota, lucro liquido e roi', () => {
    render(<Index />);

    expect(screen.getByRole('columnheader', { name: /buy in/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /sell in/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /net profit/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /roi/i })).toBeInTheDocument();
  });
});
