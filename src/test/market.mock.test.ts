import { describe, it, expect, beforeEach } from 'vitest';
import { MockMarketService } from '@/services/market.mock';

describe('MockMarketService', () => {
  let service: MockMarketService;

  beforeEach(() => {
    service = new MockMarketService();
  });

  describe('getItems()', () => {
    it('retorna um array de MarketItem', async () => {
      const items = await service.getItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('cada item tem os campos obrigatórios', async () => {
      const items = await service.getItems();
      for (const item of items) {
        expect(item).toHaveProperty('itemId');
        expect(item).toHaveProperty('itemName');
        expect(item).toHaveProperty('city');
        expect(item).toHaveProperty('tier');
        expect(item).toHaveProperty('quality');
        expect(item).toHaveProperty('sellPrice');
        expect(item).toHaveProperty('buyPrice');
        expect(item).toHaveProperty('spread');
        expect(item).toHaveProperty('spreadPercent');
        expect(item).toHaveProperty('timestamp');
        expect(item).toHaveProperty('priceHistory');
      }
    });

    it('priceHistory é um array de números', async () => {
      const items = await service.getItems();
      expect(Array.isArray(items[0].priceHistory)).toBe(true);
      expect(items[0].priceHistory.length).toBeGreaterThan(0);
    });
  });

  describe('getTopProfitable()', () => {
    it('retorna no máximo 5 itens por padrão', async () => {
      const items = await service.getTopProfitable();
      expect(items.length).toBeLessThanOrEqual(5);
    });

    it('respeita o parâmetro limit', async () => {
      const items = await service.getTopProfitable(3);
      expect(items.length).toBeLessThanOrEqual(3);
    });

    it('retorna itens com campos obrigatórios', async () => {
      const items = await service.getTopProfitable(5);
      for (const item of items) {
        expect(item).toHaveProperty('itemId');
        expect(item).toHaveProperty('spreadPercent');
      }
    });
  });

  describe('getLastUpdateTime()', () => {
    it('retorna uma string ISO de timestamp', async () => {
      const time = await service.getLastUpdateTime();
      expect(typeof time).toBe('string');
      expect(() => new Date(time)).not.toThrow();
    });
  });

  describe('getAlerts()', () => {
    it('retorna um array de Alert', async () => {
      const alerts = await service.getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('cada alert tem os campos obrigatórios', async () => {
      const alerts = await service.getAlerts();
      for (const alert of alerts) {
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('itemId');
        expect(alert).toHaveProperty('itemName');
        expect(alert).toHaveProperty('city');
        expect(alert).toHaveProperty('condition');
        expect(alert).toHaveProperty('threshold');
        expect(alert).toHaveProperty('isActive');
      }
    });
  });

  describe('saveAlert()', () => {
    it('adiciona novo alert', async () => {
      const before = await service.getAlerts();
      const newAlert = {
        id: 'test-1',
        itemId: 'ITEM_0001',
        itemName: 'Test Item',
        city: 'Caerleon',
        condition: 'below' as const,
        threshold: 10000,
        isActive: true,
        createdAt: new Date().toISOString(),
        notifications: { inApp: true, email: false },
      };
      await service.saveAlert(newAlert);
      const after = await service.getAlerts();
      expect(after.length).toBe(before.length + 1);
      expect(after.some(a => a.id === 'test-1')).toBe(true);
    });

    it('atualiza alert existente', async () => {
      const alerts = await service.getAlerts();
      const existing = alerts[0];
      await service.saveAlert({ ...existing, isActive: !existing.isActive });
      const updated = await service.getAlerts();
      const found = updated.find(a => a.id === existing.id);
      expect(found?.isActive).toBe(!existing.isActive);
    });
  });

  describe('deleteAlert()', () => {
    it('remove o alert pelo id', async () => {
      const alerts = await service.getAlerts();
      const target = alerts[0];
      await service.deleteAlert(target.id);
      const after = await service.getAlerts();
      expect(after.some(a => a.id === target.id)).toBe(false);
    });
  });
});
