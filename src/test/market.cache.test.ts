import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CACHE_KEY, CACHE_TTL_MS, readCache, writeCache, isCacheValid } from '@/services/market.cache';
import { ApiMarketService } from '@/services/market.api';
import type { MarketItem } from '@/data/types';

vi.mock('@/services/alert.storage', () => ({
  AlertStorageService: class {
    getAlerts = vi.fn().mockReturnValue([]);
    saveAlert = vi.fn();
    deleteAlert = vi.fn();
  },
}));

vi.mock('@/data/constants', async () => {
  const actual = await vi.importActual('@/data/constants');
  return {
    ...actual,
    DATA_FRESHNESS_MS: 300_000, // 5 minutos para testes
    CACHE_TTL_MS: 300_000,
  };
});

const mockItems: MarketItem[] = [
  {
    itemId: 'T4_MAIN_SWORD',
    itemName: 'Broadsword T4',
    city: 'Caerleon',
    sellPrice: 50000,
    buyPrice: 40000,
    spread: 10000,
    spreadPercent: 25,
    timestamp: '2026-03-16T10:00:00',
    tier: 'T4',
    quality: 'Normal',
    priceHistory: [45000, 47000, 50000],
  },
];

describe('market.cache — AC-1: writeCache persiste no localStorage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('CACHE_KEY é exportado como string não-vazia', () => {
    expect(typeof CACHE_KEY).toBe('string');
    expect(CACHE_KEY.length).toBeGreaterThan(0);
  });

  it('CACHE_TTL_MS é exportado com valor 300000 (5 min)', () => {
    expect(CACHE_TTL_MS).toBe(300_000);
  });

  it('writeCache persiste os dados no localStorage', () => {
    writeCache(mockItems);
    const raw = localStorage.getItem(CACHE_KEY);
    expect(raw).not.toBeNull();
  });

  it('writeCache armazena a estrutura { data, cachedAt, expiresAt }', () => {
    const before = Date.now();
    writeCache(mockItems);
    const after = Date.now();

    const entry = JSON.parse(localStorage.getItem(CACHE_KEY)!);

    expect(Array.isArray(entry.data)).toBe(true);
    expect(typeof entry.cachedAt).toBe('string');
    expect(typeof entry.expiresAt).toBe('string');

    const cachedAtMs = new Date(entry.cachedAt).getTime();
    expect(cachedAtMs).toBeGreaterThanOrEqual(before);
    expect(cachedAtMs).toBeLessThanOrEqual(after);
  });

  it('expiresAt = cachedAt + CACHE_TTL_MS', () => {
    writeCache(mockItems);
    const entry = JSON.parse(localStorage.getItem(CACHE_KEY)!);
    const diff = new Date(entry.expiresAt).getTime() - new Date(entry.cachedAt).getTime();
    expect(diff).toBe(CACHE_TTL_MS);
  });

  it('writeCache persiste os itens corretamente em entry.data', () => {
    writeCache(mockItems);
    const entry = JSON.parse(localStorage.getItem(CACHE_KEY)!);
    expect(entry.data).toHaveLength(1);
    expect(entry.data[0].itemId).toBe('T4_MAIN_SWORD');
  });
});

describe('market.cache — AC-2: readCache retorna entrada válida', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('readCache retorna null quando localStorage está vazio', () => {
    expect(readCache()).toBeNull();
  });

  it('readCache retorna a entrada quando cache existe e não expirou', () => {
    writeCache(mockItems);
    const entry = readCache();
    expect(entry).not.toBeNull();
    expect(entry!.data).toHaveLength(1);
    expect(entry!.data[0].itemId).toBe('T4_MAIN_SWORD');
  });

  it('readCache retorna cachedAt e expiresAt como strings ISO', () => {
    writeCache(mockItems);
    const entry = readCache();
    expect(new Date(entry!.cachedAt).toISOString()).toBe(entry!.cachedAt);
    expect(new Date(entry!.expiresAt).toISOString()).toBe(entry!.expiresAt);
  });
});

describe('market.cache — AC-3: isCacheValid distingue expirado de válido', () => {
  it('retorna true quando expiresAt está no futuro', () => {
    const entry = {
      data: mockItems,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    };
    expect(isCacheValid(entry)).toBe(true);
  });

  it('retorna false quando expiresAt está no passado', () => {
    const entry = {
      data: mockItems,
      cachedAt: new Date(Date.now() - CACHE_TTL_MS - 1).toISOString(),
      expiresAt: new Date(Date.now() - 1).toISOString(),
    };
    expect(isCacheValid(entry)).toBe(false);
  });
});

describe('market.cache — AC-5: cache corrompido tratado como miss', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('readCache retorna null quando localStorage tem JSON inválido', () => {
    localStorage.setItem(CACHE_KEY, 'NOT_JSON{{{');
    expect(readCache()).toBeNull();
  });

  it('readCache retorna null quando faltam campos obrigatórios (sem cachedAt/expiresAt)', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mockItems }));
    expect(readCache()).toBeNull();
  });

  it('readCache retorna null quando data não é array', () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: 'invalid',
      cachedAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
    }));
    expect(readCache()).toBeNull();
  });
});

// Integração: ApiMarketService usando o cache
describe('ApiMarketService + cache — AC-2: cache hit não chama fetch', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getItems() retorna dados do cache sem chamar fetch quando cache é válido', async () => {
    writeCache(mockItems);
    vi.stubGlobal('fetch', vi.fn());

    const service = new ApiMarketService();
    const items = await service.getItems();

    expect(globalThis.fetch as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
    expect(items).toHaveLength(1);
    expect(items[0].itemId).toBe('T4_MAIN_SWORD');
  });
});

describe('ApiMarketService + cache — AC-3: cache expirado revalida', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getItems() chama API e atualiza cache quando cache está expirado', async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: mockItems,
      cachedAt: new Date(Date.now() - CACHE_TTL_MS - 1000).toISOString(),
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }));

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([{
        item_id: 'T5_MAIN_SWORD',
        city: 'Bridgewatch',
        quality: 1,
        sell_price_min: 90000,
        sell_price_min_date: '2026-03-16T10:00:00',
        buy_price_max: 70000,
        buy_price_max_date: '2026-03-16T09:00:00',
      }]),
    }));

    const service = new ApiMarketService();
    await service.getItems();

    expect(globalThis.fetch).toHaveBeenCalled();
    const newEntry = readCache();
    expect(newEntry).not.toBeNull();
    expect(isCacheValid(newEntry!)).toBe(true);
  });
});

describe('ApiMarketService + cache — AC-4: getLastUpdateTime usa cachedAt', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getLastUpdateTime() retorna cachedAt quando dados são servidos do cache', async () => {
    const cachedAt = '2026-03-16T08:00:00.000Z';
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: mockItems,
      cachedAt,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }));

    vi.stubGlobal('fetch', vi.fn());

    const service = new ApiMarketService();
    await service.getItems();
    const lastUpdate = await service.getLastUpdateTime();

    expect(lastUpdate).toBe(cachedAt);
  });
});
