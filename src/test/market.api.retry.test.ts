/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from 'vitest';

// Todos os testes neste arquivo são RED — fetchWithRetry não existe ainda

// Mock global necessário para AC-4 e AC-5 (evita erros de exports em mockData.ts)
vi.mock('@/data/constants', () => ({
  ITEM_IDS: ['T4_MAIN_SWORD'],
  ITEM_NAMES: { T4_MAIN_SWORD: 'Broadsword T4' },
  ITEM_CATALOG: { weapons: { label: 'Weapons', ids: ['T4_MAIN_SWORD'] } },
  cities: ['Caerleon'],
  tiers: ['T4'],
  qualities: ['Normal'],
}));

vi.mock('@/services/alert.storage', () => {
  function AlertStorageService() {
    return { getAlerts: vi.fn().mockReturnValue([]), saveAlert: vi.fn(), deleteAlert: vi.fn() };
  }
  return { AlertStorageService };
});

describe('fetchWithRetry — AC-1: exportação e constantes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('fetchWithRetry é exportado de market.api', async () => {
    const mod = await import('@/services/market.api');
    expect(typeof (mod as any).fetchWithRetry).toBe('function');
  });

  it('RETRY_MAX_ATTEMPTS é exportado com valor 3', async () => {
    const { RETRY_MAX_ATTEMPTS } = await import('@/services/market.api') as any;
    expect(RETRY_MAX_ATTEMPTS).toBe(3);
  });

  it('RETRY_BASE_DELAY_MS é exportado com valor 500', async () => {
    const { RETRY_BASE_DELAY_MS } = await import('@/services/market.api') as any;
    expect(RETRY_BASE_DELAY_MS).toBe(500);
  });
});

describe('fetchWithRetry — AC-2: quais erros disparam retry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('retorna response imediatamente quando ok=true (sem retry)', async () => {
    const { fetchWithRetry } = await import('@/services/market.api') as any;
    const mockResponse = { ok: true, status: 200 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await fetchWithRetry('https://example.com');

    expect(result).toBe(mockResponse);
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('retenta em HTTP 429 até esgotar tentativas', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry, RETRY_MAX_ATTEMPTS } = await import('@/services/market.api') as any;
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 429 });
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com');
    const assertion = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(RETRY_MAX_ATTEMPTS + 1);
  });

  it('retenta em HTTP 500', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry, RETRY_MAX_ATTEMPTS } = await import('@/services/market.api') as any;
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com');
    const assertion = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(RETRY_MAX_ATTEMPTS + 1);
  });

  it('retenta em HTTP 503', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry, RETRY_MAX_ATTEMPTS } = await import('@/services/market.api') as any;
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com');
    const assertion = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(RETRY_MAX_ATTEMPTS + 1);
  });

  it('retenta em erro de rede (fetch rejeita)', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry, RETRY_MAX_ATTEMPTS } = await import('@/services/market.api') as any;
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com');
    const assertion = expect(promise).rejects.toThrow('Failed to fetch');
    await vi.runAllTimersAsync();
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(RETRY_MAX_ATTEMPTS + 1);
  });

  it('NÃO retenta em HTTP 400', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry } = await import('@/services/market.api') as any;
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 400 });
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com');
    const assertion = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('NÃO retenta em HTTP 404', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry } = await import('@/services/market.api') as any;
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com');
    const assertion = expect(promise).rejects.toThrow();
    await vi.runAllTimersAsync();
    await assertion;

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retorna response quando retry bem-sucedido (429 → ok)', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry } = await import('@/services/market.api') as any;
    const successResponse = { ok: true, status: 200 };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce(successResponse);
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com');
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toBe(successResponse);
  });
});

describe('fetchWithRetry — AC-4: AbortSignal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('NÃO retenta em AbortError — rejeita imediatamente', async () => {
    const { fetchWithRetry } = await import('@/services/market.api') as any;
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    // AbortError rejeita imediatamente — sem timers necessários
    await expect(fetchWithRetry('https://example.com')).rejects.toMatchObject({ name: 'AbortError' });

    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('para retentativas quando signal é abortado após 1ª tentativa', async () => {
    vi.useFakeTimers();
    const { fetchWithRetry } = await import('@/services/market.api') as any;
    const controller = new AbortController();

    const fetchMock = vi.fn().mockImplementation(() => {
      controller.abort();
      return Promise.resolve({ ok: false, status: 503 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const promise = fetchWithRetry('https://example.com', { signal: controller.signal });
    // Anexa o handler ANTES de avançar os timers para evitar unhandled rejection
    const assertion = expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    await vi.runAllTimersAsync().catch(() => {});
    await assertion;

    // Deve ter parado após a 1ª tentativa por causa do abort
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('fetchWithRetry — AC-5: fetchHistoryBatch mantém comportamento best-effort', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('getItems() resolve mesmo quando todas as chamadas de histórico falham após retries', async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes('/stats/prices/')) {
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue([{
            item_id: 'T4_MAIN_SWORD',
            city: 'Caerleon',
            quality: 1,
            sell_price_min: 50000,
            sell_price_min_date: '2026-03-14T10:00:00',
            buy_price_max: 40000,
            buy_price_max_date: '2026-03-14T09:00:00',
          }]),
        });
      }
      // Todas as chamadas de histórico falham com 503 (retenta internamente e depois silencia)
      return Promise.resolve({ ok: false, status: 503 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { ApiMarketService } = await import('@/services/market.api');
    const service = new ApiMarketService();

    const promise = service.getItems();
    await vi.runAllTimersAsync();
    const items = await promise;

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].itemId).toBe('T4_MAIN_SWORD');
  }, 15000);
});
