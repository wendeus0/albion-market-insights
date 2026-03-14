import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopItemsPanel } from '@/components/dashboard/TopItemsPanel'
import type { MarketItem } from '@/data/mockData'

const makeItem = (overrides: Partial<MarketItem> = {}): MarketItem => ({
  itemId: 'item-1',
  itemName: 'Clarent Blade',
  city: 'Caerleon',
  sellPrice: 150_000,
  buyPrice: 100_000,
  spread: 50_000,
  spreadPercent: 33.3,
  timestamp: new Date().toISOString(),
  tier: 'T6',
  quality: 'Good',
  priceHistory: [100, 110, 120, 115, 130],
  ...overrides,
})

describe('TopItemsPanel', () => {
  it('renderiza cabeçalho "Top Profitable Items"', () => {
    render(<TopItemsPanel items={[makeItem()]} />)
    expect(screen.getByText('Top Profitable Items')).toBeInTheDocument()
  })

  it('renderiza no máximo 5 itens mesmo com lista maior', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeItem({ itemId: `item-${i}`, itemName: `Item ${i}` })
    )
    render(<TopItemsPanel items={items} />)
    // Os rankings 1-5 devem aparecer
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.queryByText('6')).not.toBeInTheDocument()
  })

  it('renderiza nome do item', () => {
    render(<TopItemsPanel items={[makeItem({ itemName: 'Bloodletter' })]} />)
    expect(screen.getByText('Bloodletter')).toBeInTheDocument()
  })

  it('renderiza tier e cidade', () => {
    render(<TopItemsPanel items={[makeItem({ tier: 'T8', city: 'Thetford' })]} />)
    expect(screen.getByText('T8')).toBeInTheDocument()
    expect(screen.getByText(/Thetford/)).toBeInTheDocument()
  })

  it('renderiza spread percentual formatado', () => {
    render(<TopItemsPanel items={[makeItem({ spreadPercent: 33.3 })]} />)
    expect(screen.getByText('+33.3%')).toBeInTheDocument()
  })

  it('formata preços com separador de milhar', () => {
    render(<TopItemsPanel items={[makeItem({ buyPrice: 1_000_000, sellPrice: 1_500_000 })]} />)
    expect(screen.getByText(/1,000,000/)).toBeInTheDocument()
    expect(screen.getByText(/1,500,000/)).toBeInTheDocument()
  })

  it('renderiza lista vazia sem crash', () => {
    render(<TopItemsPanel items={[]} />)
    expect(screen.getByText('Top Profitable Items')).toBeInTheDocument()
  })
})
