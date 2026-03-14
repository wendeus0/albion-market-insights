import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PriceTable } from '@/components/dashboard/PriceTable'
import { useMarketFilters } from '@/store/marketFilters'
import type { MarketItem } from '@/data/mockData'

// Reset Zustand store between tests
beforeEach(() => {
  useMarketFilters.setState({
    search: '',
    cityFilter: 'all',
    tierFilter: 'all',
    qualityFilter: 'all',
    sortField: 'spreadPercent',
    sortDirection: 'desc',
  })
})

const makeItem = (overrides: Partial<MarketItem> = {}): MarketItem => ({
  itemId: 'item-default',
  itemName: 'Default Item',
  city: 'Caerleon',
  sellPrice: 100_000,
  buyPrice: 80_000,
  spread: 20_000,
  spreadPercent: 20.0,
  timestamp: new Date().toISOString(),
  tier: 'T5',
  quality: 'Normal',
  priceHistory: [80, 90, 95, 100, 100],
  ...overrides,
})

const ITEMS: MarketItem[] = [
  makeItem({ itemId: 'i1', itemName: 'Clarent Blade', city: 'Caerleon', tier: 'T6', quality: 'Good', spreadPercent: 30 }),
  makeItem({ itemId: 'i2', itemName: 'Bloodletter', city: 'Thetford', tier: 'T7', quality: 'Normal', spreadPercent: 15 }),
  makeItem({ itemId: 'i3', itemName: 'Cleric Robe', city: 'Bridgewatch', tier: 'T5', quality: 'Excellent', spreadPercent: 5 }),
]

describe('PriceTable — renderização base', () => {
  it('renderiza o campo de busca', () => {
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByPlaceholderText(/search by item name/i)).toBeInTheDocument()
  })

  it('renderiza cabeçalhos de coluna', () => {
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByRole('button', { name: /item/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sell price/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /spread/i })).toBeInTheDocument()
  })

  it('mostra contagem de itens no footer', () => {
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByText(`${ITEMS.length} of ${ITEMS.length} items`)).toBeInTheDocument()
  })
})

describe('PriceTable — busca', () => {
  it('busca por nome filtra itens corretamente', () => {
    render(<PriceTable items={ITEMS} />)
    const input = screen.getByPlaceholderText(/search by item name/i)
    fireEvent.change(input, { target: { value: 'Clarent' } })
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument()
  })

  it('busca sem resultado exibe mensagem "No items found"', () => {
    render(<PriceTable items={ITEMS} />)
    const input = screen.getByPlaceholderText(/search by item name/i)
    fireEvent.change(input, { target: { value: 'zzzzz-nao-existe' } })
    expect(screen.getByText(/no items found/i)).toBeInTheDocument()
  })

  it('busca case-insensitive', () => {
    render(<PriceTable items={ITEMS} />)
    const input = screen.getByPlaceholderText(/search by item name/i)
    fireEvent.change(input, { target: { value: 'clarent' } })
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument()
  })

  it('limpar busca restaura todos os itens', () => {
    render(<PriceTable items={ITEMS} />)
    const input = screen.getByPlaceholderText(/search by item name/i)
    fireEvent.change(input, { target: { value: 'Clarent' } })
    fireEvent.change(input, { target: { value: '' } })
    expect(screen.getByText(`${ITEMS.length} of ${ITEMS.length} items`)).toBeInTheDocument()
  })
})

describe('PriceTable — filtros de estado global (Zustand)', () => {
  it('cityFilter filtra por cidade', () => {
    useMarketFilters.setState({ cityFilter: 'Thetford' })
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument()
  })

  it('tierFilter filtra por tier', () => {
    useMarketFilters.setState({ tierFilter: 'T6' })
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument()
  })

  it('qualityFilter filtra por qualidade', () => {
    useMarketFilters.setState({ qualityFilter: 'Excellent' })
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument()
  })

  it('combinação de filtros aplica todos simultaneamente', () => {
    useMarketFilters.setState({ cityFilter: 'Caerleon', tierFilter: 'T6' })
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByText('1 of 3 items')).toBeInTheDocument()
  })

  it('filtro que não bate retorna zero itens', () => {
    useMarketFilters.setState({ cityFilter: 'Caerleon', tierFilter: 'T7' })
    render(<PriceTable items={ITEMS} />)
    expect(screen.getByText('0 of 3 items')).toBeInTheDocument()
    expect(screen.getByText(/no items found/i)).toBeInTheDocument()
  })
})

describe('PriceTable — XSS (segurança)', () => {
  it('input de busca com payload XSS não executa script', () => {
    render(<PriceTable items={ITEMS} />)
    const input = screen.getByPlaceholderText(/search by item name/i)
    fireEvent.change(input, { target: { value: '<script>alert("xss")</script>' } })
    // React escapa o valor — não deve haver tag <script> no DOM
    const scripts = document.querySelectorAll('script[data-xss]')
    expect(scripts).toHaveLength(0)
    // O texto deve aparecer escaped, não executado
    expect(screen.getByText(/no items found/i)).toBeInTheDocument()
  })
})
