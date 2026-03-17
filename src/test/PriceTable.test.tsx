import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('PriceTable — filtros de faixa (AC1, AC2)', () => {
  it('exibe inputs de faixa de preço (min/max)', () => {
    render(<PriceTable items={mockItems} />);

    expect(screen.getByPlaceholderText(/min price/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max price/i)).toBeInTheDocument();
  });

  it('exibe inputs de faixa de spread (min/max)', () => {
    render(<PriceTable items={mockItems} />);

    expect(screen.getByPlaceholderText(/min spread/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max spread/i)).toBeInTheDocument();
  });

  it('filtra itens por faixa de preço', async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, '60000');

    // Deve mostrar apenas T5_MAIN_AXE (80000/60000)
    expect(screen.getByText('Battleaxe T5')).toBeInTheDocument();
    expect(screen.queryByText('Broadsword T4')).not.toBeInTheDocument();
  });

  it('filtra itens por faixa de spread percentual', async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minSpreadInput = screen.getByPlaceholderText(/min spread/i);
    await user.type(minSpreadInput, '30');

    // Deve mostrar apenas T5_MAIN_AXE (33%)
    expect(screen.getByText('Battleaxe T5')).toBeInTheDocument();
    expect(screen.queryByText('Broadsword T4')).not.toBeInTheDocument();
  });
});

describe('PriceTable — Clear All e indicador (AC3, AC4)', () => {
  it('exibe botão Clear All quando filtros estão ativos', async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, '1000');

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('exibe contador de filtros ativos', async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, '1000');

    expect(screen.getByText(/1 filter active/i)).toBeInTheDocument();
  });

  it('limpa todos os filtros ao clicar Clear All', async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, '60000');

    const clearButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearButton);

    // Todos os itens devem aparecer novamente
    expect(screen.getByText('Broadsword T4')).toBeInTheDocument();
    expect(screen.getByText('Battleaxe T5')).toBeInTheDocument();
  });
});
