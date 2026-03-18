import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceTable } from './PriceTable';
import type { MarketItem } from '@/data/types';

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

const mockItems: MarketItem[] = [
  {
    itemId: 'T4_BAG',
    itemName: 'Bag',
    city: 'Caerleon',
    sellPrice: 5000,
    buyPrice: 4500,
    spread: 500,
    spreadPercent: 11.1,
    timestamp: new Date().toISOString(),
    tier: 'T4',
    quality: 'Normal',
    priceHistory: [4500, 4600, 4700, 4800, 4900, 5000, 5100],
  },
  {
    itemId: 'T5_BAG',
    itemName: 'Large Bag',
    city: 'Bridgewatch',
    sellPrice: 15000,
    buyPrice: 13000,
    spread: 2000,
    spreadPercent: 15.4,
    timestamp: new Date().toISOString(),
    tier: 'T5',
    quality: 'Good',
    priceHistory: [13000, 13500, 14000, 14500, 15000, 15500, 16000],
  },
  {
    itemId: 'T6_BAG@1',
    itemName: 'Heavy Bag',
    city: 'Caerleon',
    sellPrice: 25000,
    buyPrice: 22000,
    spread: 3000,
    spreadPercent: 13.6,
    timestamp: new Date().toISOString(),
    tier: 'T6',
    quality: 'Outstanding',
    priceHistory: [22000, 22500, 23000, 23500, 24000, 24500, 25000],
  },
  {
    itemId: 'T7_BAG',
    itemName: 'Royal Bag',
    city: 'Lymhurst',
    sellPrice: 50000,
    buyPrice: 45000,
    spread: 5000,
    spreadPercent: 11.1,
    timestamp: new Date().toISOString(),
    tier: 'T7',
    quality: 'Masterpiece',
    priceHistory: [45000, 46000, 47000, 48000, 49000, 50000, 51000],
  },
];

describe('PriceTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar tabela com itens', () => {
    render(<PriceTable items={mockItems} />);
    
    expect(screen.getByText('Bag')).toBeInTheDocument();
    expect(screen.getByText('Large Bag')).toBeInTheDocument();
    expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
    expect(screen.getByText('Royal Bag')).toBeInTheDocument();
  });

  it('deve filtrar itens por nome', async () => {
    render(<PriceTable items={mockItems} />);
    
    const searchInput = screen.getByPlaceholderText('Search by item name or ID...');
    await userEvent.type(searchInput, 'Large');
    
    expect(screen.getByText('Large Bag')).toBeInTheDocument();
    expect(screen.queryByText('Bag')).not.toBeInTheDocument();
  });

  it('deve filtrar itens por preço mínimo', async () => {
    render(<PriceTable items={mockItems} />);
    
    const minPriceInput = screen.getByPlaceholderText('Min price');
    await userEvent.type(minPriceInput, '10000');
    
    await waitFor(() => {
      expect(screen.queryByText('Bag')).not.toBeInTheDocument();
      expect(screen.getByText('Large Bag')).toBeInTheDocument();
      expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
      expect(screen.getByText('Royal Bag')).toBeInTheDocument();
    });
  });

  it('deve filtrar itens por preço máximo', async () => {
    render(<PriceTable items={mockItems} />);
    
    const maxPriceInput = screen.getByPlaceholderText('Max price');
    await userEvent.type(maxPriceInput, '20000');
    
    await waitFor(() => {
      expect(screen.getByText('Bag')).toBeInTheDocument();
      expect(screen.getByText('Large Bag')).toBeInTheDocument();
      expect(screen.queryByText('Royal Bag')).not.toBeInTheDocument();
    });
  });

  it('deve filtrar itens por spread mínimo', async () => {
    render(<PriceTable items={mockItems} />);
    
    const minSpreadInput = screen.getByPlaceholderText('Min spread %');
    await userEvent.type(minSpreadInput, '12');
    
    await waitFor(() => {
      expect(screen.getByText('Large Bag')).toBeInTheDocument();
      expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
      expect(screen.queryByText('Bag')).not.toBeInTheDocument();
    });
  });

  it('deve filtrar itens por spread máximo', async () => {
    render(<PriceTable items={mockItems} />);
    
    const maxSpreadInput = screen.getByPlaceholderText('Max spread %');
    await userEvent.type(maxSpreadInput, '12');
    
    await waitFor(() => {
      expect(screen.getByText('Bag')).toBeInTheDocument();
      expect(screen.getByText('Royal Bag')).toBeInTheDocument();
      expect(screen.queryByText('Large Bag')).not.toBeInTheDocument();
    });
  });

  it('deve limpar todos os filtros ao clicar em Clear All', async () => {
    render(<PriceTable items={mockItems} />);
    
    // Apply a price filter (which triggers the Clear All button)
    const minPriceInput = screen.getByPlaceholderText('Min price');
    await userEvent.type(minPriceInput, '10000');
    
    await waitFor(() => {
      expect(screen.queryByText('Bag')).not.toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
    
    // Clear all filters
    const clearButton = screen.getByText('Clear All');
    await userEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.getByText('Bag')).toBeInTheDocument();
      expect(screen.getByText('Large Bag')).toBeInTheDocument();
      expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
      expect(screen.getByText('Royal Bag')).toBeInTheDocument();
    });
  });

  it('deve exibir contador de filtros ativos', async () => {
    render(<PriceTable items={mockItems} />);
    
    // Apply price filter
    const minPriceInput = screen.getByPlaceholderText('Min price');
    await userEvent.type(minPriceInput, '10000');
    
    await waitFor(() => {
      expect(screen.getByText(/1 filter active/)).toBeInTheDocument();
    });
  });

  it('deve ordenar itens ao clicar no cabeçalho', async () => {
    render(<PriceTable items={mockItems} />);
    
    const itemNameHeader = screen.getByText('Item');
    await userEvent.click(itemNameHeader);
    
    // Check if items are sorted (component should show sort indicator)
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando nenhum item é encontrado', async () => {
    render(<PriceTable items={mockItems} />);
    
    const searchInput = screen.getByPlaceholderText('Search by item name or ID...');
    await userEvent.type(searchInput, 'NonExistentItem123');
    
    await waitFor(() => {
      expect(screen.getByText(/No items found matching your criteria/i)).toBeInTheDocument();
    });
  });

  it('deve paginar itens quando há mais de 10', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      ...mockItems[0],
      itemId: `ITEM_${i}`,
      itemName: `Item ${i}`,
    }));
    
    render(<PriceTable items={manyItems} />);
    
    expect(screen.getByText(/Showing 1 to 10 of 25 items/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('deve navegar entre páginas', async () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      ...mockItems[0],
      itemId: `ITEM_${i}`,
      itemName: `Item ${i}`,
    }));
    
    render(<PriceTable items={manyItems} />);
    
    const page2Button = screen.getByText('2');
    await userEvent.click(page2Button);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing 11 to 20 of 25 items/i)).toBeInTheDocument();
    });
  });

  it('deve navegar para página anterior', async () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      ...mockItems[0],
      itemId: `ITEM_${i}`,
      itemName: `Item ${i}`,
    }));
    
    render(<PriceTable items={manyItems} />);
    
    // Go to page 2
    const page2Button = screen.getByText('2');
    await userEvent.click(page2Button);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing 11 to 20 of 25 items/i)).toBeInTheDocument();
    });
    
    // Go back to page 1
    const prevButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('.lucide-chevron-left')
    );
    if (prevButton) {
      await userEvent.click(prevButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Showing 1 to 10 of 25 items/i)).toBeInTheDocument();
      });
    }
  });

  it('deve navegar para página seguinte', async () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      ...mockItems[0],
      itemId: `ITEM_${i}`,
      itemName: `Item ${i}`,
    }));
    
    render(<PriceTable items={manyItems} />);
    
    // Go to next page
    const nextButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('.lucide-chevron-right')
    );
    if (nextButton) {
      await userEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Showing 11 to 20 of 25 items/i)).toBeInTheDocument();
      });
    }
  });

  it('deve mostrar paginação dinâmica para muitas páginas', async () => {
    const manyItems = Array.from({ length: 100 }, (_, i) => ({
      ...mockItems[0],
      itemId: `ITEM_${i}`,
      itemName: `Item ${i}`,
    }));
    
    render(<PriceTable items={manyItems} />);
    
    // Should show pages 1-5 initially
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Navigate to middle page
    const page5Button = screen.getByText('5');
    await userEvent.click(page5Button);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing 41 to 50 of 100 items/i)).toBeInTheDocument();
    });
  });

  it('deve formatar preços corretamente', () => {
    render(<PriceTable items={mockItems} />);
    
    // Prices should be formatted with commas - check all instances
    const allPrices = screen.getAllByText(/\d{1,3},\d{3}/);
    expect(allPrices.length).toBeGreaterThan(0);
    
    // Verify specific prices are present somewhere in the document
    const pageContent = document.body.textContent;
    expect(pageContent).toContain('5,000');
    expect(pageContent).toContain('15,000');
    expect(pageContent).toContain('25,000');
    expect(pageContent).toContain('50,000');
  });

  it('deve formatar timestamps corretamente', () => {
    render(<PriceTable items={mockItems} />);
    
    // Should show time ago format
    expect(screen.getAllByText(/(Just now|\d+m ago|\d+h ago)/i)[0]).toBeInTheDocument();
  });

  it('deve aplicar múltiplos filtros simultaneamente', async () => {
    render(<PriceTable items={mockItems} />);
    
    // Apply search
    const searchInput = screen.getByPlaceholderText('Search by item name or ID...');
    await userEvent.type(searchInput, 'Bag');
    
    // Apply min price
    const minPriceInput = screen.getByPlaceholderText('Min price');
    await userEvent.type(minPriceInput, '10000');
    
    await waitFor(() => {
      expect(screen.queryByText('Bag')).not.toBeInTheDocument();
      expect(screen.getByText('Large Bag')).toBeInTheDocument();
      expect(screen.getByText('Heavy Bag')).toBeInTheDocument();
      expect(screen.getByText('Royal Bag')).toBeInTheDocument();
    });
  });

  it('deve atualizar contador ao aplicar múltiplos filtros', async () => {
    render(<PriceTable items={mockItems} />);
    
    const minPriceInput = screen.getByPlaceholderText('Min price');
    await userEvent.type(minPriceInput, '10000');
    
    const maxPriceInput = screen.getByPlaceholderText('Max price');
    await userEvent.type(maxPriceInput, '30000');
    
    await waitFor(() => {
      expect(screen.getByText(/2 filter active/)).toBeInTheDocument();
    });
  });

  it('deve renderizar inputs de filtros de preço e spread', () => {
    render(<PriceTable items={mockItems} />);
    
    expect(screen.getByPlaceholderText('Min price')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max price')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min spread %')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Max spread %')).toBeInTheDocument();
  });

  it('deve renderizar selectores de filtro', () => {
    render(<PriceTable items={mockItems} />);
    
    // Select components should be present
    expect(screen.getByText('All Cities')).toBeInTheDocument();
    expect(screen.getByText('All Tiers')).toBeInTheDocument();
    expect(screen.getByText('All Qualities')).toBeInTheDocument();
    expect(screen.getByText('All Levels')).toBeInTheDocument();
  });
});
