const STORAGE_KEY = "albion_price_filters";

export interface FilterState {
  categoryFilter?: string;
  cityFilter?: string;
  tierFilter?: string;
  qualityFilter?: string;
  enchantFilter?: string;
  minPrice?: string;
  maxPrice?: string;
  minSpread?: string;
  maxSpread?: string;
}

const defaultState: FilterState = {
  categoryFilter: "all",
  cityFilter: "all",
  tierFilter: "all",
  qualityFilter: "all",
  enchantFilter: "all",
  minPrice: "",
  maxPrice: "",
  minSpread: "",
  maxSpread: "",
};

function isValidFilterState(state: unknown): state is FilterState {
  if (typeof state !== "object" || state === null) return false;

  const s = state as Record<string, unknown>;

  // Verifica se todos os valores são strings ou undefined
  const stringFields = [
    "categoryFilter",
    "cityFilter",
    "tierFilter",
    "qualityFilter",
    "enchantFilter",
    "minPrice",
    "maxPrice",
    "minSpread",
    "maxSpread",
  ];

  for (const field of stringFields) {
    const value = s[field];
    if (value !== undefined && typeof value !== "string") {
      return false;
    }
  }

  return true;
}

export class FilterStorageService {
  getFilters(): FilterState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };

      const parsed = JSON.parse(raw);

      if (!isValidFilterState(parsed)) {
        // Dados inválidos - limpa o localStorage
        localStorage.removeItem(STORAGE_KEY);
        return { ...defaultState };
      }

      return { ...defaultState, ...parsed };
    } catch {
      // JSON inválido - limpa o localStorage
      localStorage.removeItem(STORAGE_KEY);
      return { ...defaultState };
    }
  }

  saveFilters(filters: FilterState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }

  clearFilters(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const filterStorage = new FilterStorageService();
