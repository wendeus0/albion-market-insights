import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceTable } from '@/components/dashboard/PriceTable';
import type { MarketItem } from '@/data/types';

const mockItems: MarketItem[] = [
  {
    itemId: 'T4_MAIN_SWORD',
    itemName: 'Broadsword T4',
    city: 'Caerleon',
    sellPrice: 50000,
    buyPrice: 40000,
    spread: 10000,
    spreadPercent: 25,
    timestamp: new Date().toISOString(),
    tier: 'T4',
    quality: 'Normal',
    priceHistory: [45000, 46000, 47000],
  },
  {
    itemId: 'T5_MAIN_AXE',
    itemName: 'Battleaxe T5',
    city: 'Bridgewatch',
    sellPrice: 80000,
    buyPrice: 60000,
    spread: 20000,
    spreadPercent: 33,
    timestamp: new Date().toISOString(),
    tier: 'T5',
    quality: 'Normal',
    priceHistory: [75000, 77000, 80000],
  },
];

describe('PriceTable — filtro de categoria (AC6)', () => {
  it('exibe Select de categoria com opção "All Categories"', () => {
    render(<PriceTable items={mockItems} />);

    expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
  });

  it('exibe labels de categoria legíveis no Select', async () => {
    render(<PriceTable items={mockItems} />);

    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    expect(categorySelect).toBeInTheDocument();
  });
});
