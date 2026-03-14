import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'

describe('StatsCard', () => {
  it('renderiza título e valor', () => {
    render(<StatsCard title="Total Items" value={1234} icon={TrendingUp} />)
    expect(screen.getByText('Total Items')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('renderiza subtitle quando fornecido', () => {
    render(
      <StatsCard title="Spread Médio" value="12.5%" subtitle="últimas 24h" icon={TrendingUp} />
    )
    expect(screen.getByText('últimas 24h')).toBeInTheDocument()
  })

  it('não renderiza subtitle quando ausente', () => {
    render(<StatsCard title="Spread Médio" value="12.5%" icon={TrendingUp} />)
    expect(screen.queryByText('últimas 24h')).not.toBeInTheDocument()
  })

  it('renderiza trend positivo com sinal +', () => {
    render(
      <StatsCard
        title="Spread"
        value="15%"
        icon={TrendingUp}
        trend={{ value: 8, isPositive: true }}
      />
    )
    expect(screen.getByText('+8%')).toBeInTheDocument()
  })

  it('renderiza trend negativo sem sinal +', () => {
    render(
      <StatsCard
        title="Spread"
        value="15%"
        icon={TrendingUp}
        trend={{ value: 3, isPositive: false }}
      />
    )
    expect(screen.getByText('3%')).toBeInTheDocument()
    expect(screen.queryByText('+3%')).not.toBeInTheDocument()
  })

  it('não renderiza badge de trend quando ausente', () => {
    render(<StatsCard title="Total" value={100} icon={TrendingUp} />)
    // Não deve haver nenhum elemento com classe de success/destructive de trend
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument()
  })
})
