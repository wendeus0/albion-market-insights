import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiMarketService } from '@/services/market.api';

const validApiResponse = [
  {
    item_id: 'T4_MAIN_SWORD',
    city: 'Caerleon',
    quality: 1,
    sell_price_min: 50000,
    sell_price_min_date: '2026-03-14T10:00:00',
    buy_price_max: 40000,
    buy_price_max_date: '2026-03-14T09:00:00',
  },
  {
    item_id: 'T5_MAIN_SWORD',
    city: 'Bridgewatch',
    quality: 2,
    sell_price_min: 80000,
    sell_price_min_date: '2026-03-14T10:00:00',
    buy_price_max: 60000,
    buy_price_max_date: '2026-03-14T09:00:00',
  },
];

// Mock AlertStorageService para não depender de localStorage
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

describe('ApiMarketService', () => {
  let service: ApiMarketService;

  beforeEach(() => {
    service = new ApiMarketService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getItems()', () => {
    it('mapeia resposta válida da API para MarketItem[]', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(validApiResponse),
      }));

      const items = await service.getItems();
      expect(items.length).toBe(2);
      expect(items[0].itemId).toBe('T4_MAIN_SWORD');
      expect(items[0].city).toBe('Caerleon');
      expect(items[0].sellPrice).toBe(50000);
      expect(items[0].buyPrice).toBe(40000);
      expect(items[0].tier).toBe('T4');
      expect(items[0].quality).toBe('Normal');
    });

    it('filtra registros com campos inválidos sem crash (Zod)', async () => {
      const responseWithInvalid = [
        ...validApiResponse,
        { item_id: 'INVALID', city: 'Caerleon', quality: 99 }, // quality fora do range
        { item_id: 'MISSING_PRICES' }, // sem campos obrigatórios
      ];

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(responseWithInvalid),
      }));

      const items = await service.getItems();
      expect(items.length).toBe(2); // apenas os válidos
    });

    it('propaga erro de rede', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      await expect(service.getItems()).rejects.toThrow('Network error');
    });

    it('lança erro quando API retorna status != 200', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue([]),
      }));
      await expect(service.getItems()).rejects.toThrow('Albion API error: 503');
    });
  });

  describe('getTopProfitable()', () => {
    it('retorna itens ordenados por spreadPercent decrescente', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(validApiResponse),
      }));

      const items = await service.getTopProfitable(2);
      expect(items.length).toBeLessThanOrEqual(2);
      if (items.length > 1) {
        expect(items[0].spreadPercent).toBeGreaterThanOrEqual(items[1].spreadPercent);
      }
    });
  });

  describe('albionRecordToMarketItem()', () => {
    it('mapeia quality numérica corretamente', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([
          { ...validApiResponse[0], quality: 1 },
          { ...validApiResponse[1], quality: 2 },
        ]),
      }));
      const items = await service.getItems();
      expect(items[0].quality).toBe('Normal');
      expect(items[1].quality).toBe('Good');
    });

    it('calcula spread e spreadPercent corretamente', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([validApiResponse[0]]),
      }));
      const items = await service.getItems();
      expect(items[0].spread).toBe(10000);
      expect(items[0].spreadPercent).toBeCloseTo(25, 0);
    });
  });
});
