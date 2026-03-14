import { create } from 'zustand'

export type SortField = 'itemName' | 'city' | 'sellPrice' | 'buyPrice' | 'spread' | 'spreadPercent' | 'timestamp'
export type SortDirection = 'asc' | 'desc'

interface MarketFiltersState {
  search: string
  cityFilter: string
  tierFilter: string
  qualityFilter: string
  sortField: SortField
  sortDirection: SortDirection
  setSearch: (v: string) => void
  setCityFilter: (v: string) => void
  setTierFilter: (v: string) => void
  setQualityFilter: (v: string) => void
  handleSort: (field: SortField) => void
}

export const useMarketFilters = create<MarketFiltersState>((set, get) => ({
  search: '',
  cityFilter: 'all',
  tierFilter: 'all',
  qualityFilter: 'all',
  sortField: 'spreadPercent',
  sortDirection: 'desc',
  setSearch: (v) => set({ search: v }),
  setCityFilter: (v) => set({ cityFilter: v }),
  setTierFilter: (v) => set({ tierFilter: v }),
  setQualityFilter: (v) => set({ qualityFilter: v }),
  handleSort: (field) => {
    const { sortField, sortDirection } = get()
    if (sortField === field) {
      set({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' })
    } else {
      set({ sortField: field, sortDirection: 'desc' })
    }
  },
}))
