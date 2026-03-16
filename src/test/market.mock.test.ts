import { describe, it, expect, beforeEach } from 'vitest';
import { MockMarketService } from '@/services/market.mock';

describe('MockMarketService', () => {
  let service: MockMarketService;

  beforeEach(() => {
    service = new MockMarketService();
  });

  describe('getItems()', () => {
    it('retorna um array de MarketItem', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const items = await service.getItems();

      // Then
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('cada item tem os campos obrigatórios', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const items = await service.getItems();

      // Then
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
      // Given: new MockMarketService (beforeEach)

      // When
      const items = await service.getItems();

      // Then
      expect(Array.isArray(items[0].priceHistory)).toBe(true);
      expect(items[0].priceHistory.length).toBeGreaterThan(0);
    });
  });

  describe('getTopProfitable()', () => {
    it('retorna no máximo 5 itens por padrão', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const items = await service.getTopProfitable();

      // Then
      expect(items.length).toBeLessThanOrEqual(5);
    });

    it('respeita o parâmetro limit', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const items = await service.getTopProfitable(3);

      // Then
      expect(items.length).toBeLessThanOrEqual(3);
    });

    it('retorna itens com campos obrigatórios', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const items = await service.getTopProfitable(5);

      // Then
      for (const item of items) {
        expect(item).toHaveProperty('itemId');
        expect(item).toHaveProperty('spreadPercent');
      }
    });
  });

  describe('getLastUpdateTime()', () => {
    it('retorna uma string ISO de timestamp', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const time = await service.getLastUpdateTime();

      // Then
      expect(typeof time).toBe('string');
      expect(() => new Date(time)).not.toThrow();
    });
  });

  describe('getAlerts()', () => {
    it('retorna um array de Alert', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const alerts = await service.getAlerts();

      // Then
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('cada alert tem os campos obrigatórios', async () => {
      // Given: new MockMarketService (beforeEach)

      // When
      const alerts = await service.getAlerts();

      // Then
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
      // Given
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

      // When
      await service.saveAlert(newAlert);

      // Then
      const after = await service.getAlerts();
      expect(after.length).toBe(before.length + 1);
      expect(after.some(a => a.id === 'test-1')).toBe(true);
    });

    it('atualiza alert existente', async () => {
      // Given
      const alerts = await service.getAlerts();
      const existing = alerts[0];

      // When
      await service.saveAlert({ ...existing, isActive: !existing.isActive });

      // Then
      const updated = await service.getAlerts();
      const found = updated.find(a => a.id === existing.id);
      expect(found?.isActive).toBe(!existing.isActive);
    });
  });

  describe('deleteAlert()', () => {
    it('remove o alert pelo id', async () => {
      // Given
      const alerts = await service.getAlerts();
      const target = alerts[0];

      // When
      await service.deleteAlert(target.id);

      // Then
      const after = await service.getAlerts();
      expect(after.some(a => a.id === target.id)).toBe(false);
    });
  });
});
