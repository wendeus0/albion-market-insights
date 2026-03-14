import { describe, it, expect, beforeEach } from 'vitest'
import { useMarketFilters } from '@/store/marketFilters'

// Reset store state between tests
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

describe('marketFilters store', () => {
  describe('estado inicial', () => {
    it('search começa vazio', () => {
      expect(useMarketFilters.getState().search).toBe('')
    })

    it('filtros começam como "all"', () => {
      const { cityFilter, tierFilter, qualityFilter } = useMarketFilters.getState()
      expect(cityFilter).toBe('all')
      expect(tierFilter).toBe('all')
      expect(qualityFilter).toBe('all')
    })

    it('sort padrão é spreadPercent desc', () => {
      const { sortField, sortDirection } = useMarketFilters.getState()
      expect(sortField).toBe('spreadPercent')
      expect(sortDirection).toBe('desc')
    })
  })

  describe('setters', () => {
    it('setSearch atualiza o campo search', () => {
      useMarketFilters.getState().setSearch('Clarent')
      expect(useMarketFilters.getState().search).toBe('Clarent')
    })

    it('setCityFilter atualiza cityFilter', () => {
      useMarketFilters.getState().setCityFilter('Caerleon')
      expect(useMarketFilters.getState().cityFilter).toBe('Caerleon')
    })

    it('setTierFilter atualiza tierFilter', () => {
      useMarketFilters.getState().setTierFilter('T6')
      expect(useMarketFilters.getState().tierFilter).toBe('T6')
    })

    it('setQualityFilter atualiza qualityFilter', () => {
      useMarketFilters.getState().setQualityFilter('Masterpiece')
      expect(useMarketFilters.getState().qualityFilter).toBe('Masterpiece')
    })
  })

  describe('handleSort', () => {
    it('mudar campo de sort define sortDirection como desc', () => {
      useMarketFilters.getState().handleSort('sellPrice')
      const { sortField, sortDirection } = useMarketFilters.getState()
      expect(sortField).toBe('sellPrice')
      expect(sortDirection).toBe('desc')
    })

    it('clicar no mesmo campo inverte a direção', () => {
      // Primeiro clique — já está em spreadPercent desc
      useMarketFilters.getState().handleSort('spreadPercent')
      expect(useMarketFilters.getState().sortDirection).toBe('asc')
    })

    it('clicar duas vezes no mesmo campo volta para desc', () => {
      useMarketFilters.getState().handleSort('spreadPercent') // desc → asc
      useMarketFilters.getState().handleSort('spreadPercent') // asc → desc
      expect(useMarketFilters.getState().sortDirection).toBe('desc')
    })

    it('trocar de campo não herda a direção anterior', () => {
      useMarketFilters.getState().handleSort('spreadPercent') // vira asc
      useMarketFilters.getState().handleSort('sellPrice')     // novo campo → sempre desc
      const { sortField, sortDirection } = useMarketFilters.getState()
      expect(sortField).toBe('sellPrice')
      expect(sortDirection).toBe('desc')
    })
  })
})
