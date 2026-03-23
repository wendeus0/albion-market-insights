import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.stubEnv("VITE_USE_PROXY", "false");

const MOCK_IDS = Array.from({ length: 200 }, (_, i) => `T4_ITEM_${i}`);

vi.mock('@/data/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/constants')>();

  return {
    ...actual,
    ITEM_IDS: MOCK_IDS,
    ITEM_NAMES: actual.ITEM_NAMES,
  };
});

vi.mock('@/services/alert.storage', () => {
  function MockAlertStorageService() {
    return {
      getAlerts: vi.fn().mockReturnValue([]),
      saveAlert: vi.fn(),
      deleteAlert: vi.fn(),
    };
  }
  return { AlertStorageService: MockAlertStorageService };
});

vi.mock('@/services/market.mock', () => {
  function MockMarketService() {
    return { getItems: vi.fn().mockResolvedValue([]) };
  }
  return { MockMarketService };
});

describe('ApiMarketService — batch loading', () => {
  let service: import('@/services/market.api').ApiMarketService;

  beforeEach(async () => {
    const { ApiMarketService } = await import('@/services/market.api');
    service = new ApiMarketService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getItems() com 200 IDs faz ≥2 fetches de prices (AC3)', async () => {
    // Given
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
    vi.stubGlobal('fetch', fetchSpy);

    // When
    await service.getItems();

    // Then: 2 batches de 100 items = 2 chamadas de price + N de history
    const priceCalls = fetchSpy.mock.calls.filter(([url]) =>
      (url as string).includes('/stats/prices/')
    );
    expect(priceCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('falha em 1 batch não cancela os outros batches (AC4)', async () => {
    // Given: 200 items = 2 batches; batch 1 falha, batch 2 retorna 1 item
    const validRecord = {
      item_id: 'T4_ITEM_100',
      city: 'Caerleon',
      quality: 1,
      sell_price_min: 50000,
      sell_price_min_date: '2026-03-14T10:00:00',
      buy_price_max: 40000,
      buy_price_max_date: '2026-03-14T09:00:00',
    };

    let priceCallIndex = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes('/stats/prices/')) {
        priceCallIndex++;
        if (priceCallIndex === 1) {
          return Promise.resolve({ ok: false, status: 500, json: vi.fn() });
        }
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([validRecord]),
        });
      }
      return Promise.resolve({ ok: true, json: vi.fn().mockResolvedValue([]) });
    }));

    // When
    const items = await service.getItems();

    // Then: itens do batch 2 aparecem no resultado mesmo com batch 1 falhando
    expect(items.some(i => i.itemId === 'T4_ITEM_100')).toBe(true);
  });
});

describe('withConcurrency', () => {
  it('mantém no máximo limit tasks simultâneas (AC5)', async () => {
    // Given
    const { withConcurrency } = await import('@/services/market.api');
    let concurrent = 0;
    let maxConcurrent = 0;

    const makeTask = () => async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise(resolve => setTimeout(resolve, 10));
      concurrent--;
    };

    const LIMIT = 3;
    const tasks = Array.from({ length: 9 }, makeTask);

    // When
    await withConcurrency(tasks, LIMIT);

    // Then
    expect(maxConcurrent).toBeLessThanOrEqual(LIMIT);
    expect(maxConcurrent).toBeGreaterThan(0);
  }, 5000);

  it('chunkArray divide array em chunks do tamanho correto', async () => {
    const { chunkArray } = await import('@/services/market.api');
    const arr = Array.from({ length: 250 }, (_, i) => i);

    const chunks = chunkArray(arr, 100);

    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(100);
    expect(chunks[1].length).toBe(100);
    expect(chunks[2].length).toBe(50);
  });
});
