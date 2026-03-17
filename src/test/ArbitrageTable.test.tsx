import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArbitrageTable } from '@/components/dashboard/ArbitrageTable';
import type { ArbitrageOpportunity } from '@/data/types';

const mockItems: ArbitrageOpportunity[] = [
  {
    itemId: 'T8_2H_HOLYSTAFF_HELL@3',
    itemName: 'Great Holy Staff T8 .3',
    tier: 'T8',
    quality: 'Good',
    buyCity: 'Martlock',
    buyPrice: 5_900_000,
    sellCity: 'Caerleon',
    sellPrice: 7_200_000,
    netProfit: 832_000,
    netProfitPercent: 14.1,
    timestamp: '2026-03-17T10:00:00.000Z',
  },
  {
    itemId: 'T5_MAIN_SWORD',
    itemName: 'Broadsword T5',
    tier: 'T5',
    quality: 'Normal',
    buyCity: 'Lymhurst',
    buyPrice: 50_000,
    sellCity: 'Bridgewatch',
    sellPrice: 70_000,
    netProfit: 15_450,
    netProfitPercent: 30.9,
    timestamp: '2026-03-17T10:00:00.000Z',
  },
];

describe('ArbitrageTable refinements', () => {
  it('deve exibir input para lucro liquido minimo', () => {
    render(<ArbitrageTable items={mockItems} />);

    expect(screen.getByPlaceholderText(/min net profit/i)).toBeInTheDocument();
  });

  it('deve exibir input para roi minimo', () => {
    render(<ArbitrageTable items={mockItems} />);

    expect(screen.getByPlaceholderText(/min roi/i)).toBeInTheDocument();
  });

  it('deve filtrar oportunidades por lucro liquido minimo', async () => {
    const user = userEvent.setup();
    render(<ArbitrageTable items={mockItems} />);

    await user.type(screen.getByPlaceholderText(/min net profit/i), '100000');

    expect(screen.getByText('Great Holy Staff T8 .3')).toBeInTheDocument();
    expect(screen.queryByText('Broadsword T5')).not.toBeInTheDocument();
  });

  it('deve filtrar oportunidades por roi minimo', async () => {
    const user = userEvent.setup();
    render(<ArbitrageTable items={mockItems} />);

    await user.type(screen.getByPlaceholderText(/min roi/i), '20');

    expect(screen.queryByText('Great Holy Staff T8 .3')).not.toBeInTheDocument();
    expect(screen.getByText('Broadsword T5')).toBeInTheDocument();
  });

  it('deve combinar busca textual com filtros minimos', async () => {
    const user = userEvent.setup();
    render(<ArbitrageTable items={mockItems} />);

    await user.type(screen.getByPlaceholderText(/search item, buy city or sell city/i), 'holy');
    await user.type(screen.getByPlaceholderText(/min net profit/i), '500000');
    await user.type(screen.getByPlaceholderText(/min roi/i), '10');

    expect(screen.getByText('Great Holy Staff T8 .3')).toBeInTheDocument();
    expect(screen.queryByText('Broadsword T5')).not.toBeInTheDocument();
  });
});
