import { describe, it, expect } from 'vitest';
import { checkAlerts } from '@/services/alert.engine';
import type { MarketItem, Alert } from '@/data/types';

function makeItem(overrides: Partial<MarketItem> = {}): MarketItem {
  return {
    itemId: 'ITEM_0001',
    itemName: 'Clarent Blade',
    city: 'Caerleon',
    sellPrice: 50000,
    buyPrice: 40000,
    spread: 10000,
    spreadPercent: 20,
    timestamp: new Date().toISOString(),
    tier: 'T4',
    quality: 'Normal',
    priceHistory: [],
    ...overrides,
  };
}

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alert-1',
    itemId: 'ITEM_0001',
    itemName: 'Clarent Blade',
    city: 'Caerleon',
    condition: 'below',
    threshold: 60000,
    isActive: true,
    createdAt: new Date().toISOString(),
    notifications: { inApp: true, email: false },
    ...overrides,
  };
}

describe('checkAlerts()', () => {
  it('dispara alerta condition=below quando preço está abaixo do threshold', () => {
    // Given
    const items = [makeItem({ sellPrice: 30000 })];
    const alerts = [makeAlert({ condition: 'below', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
    expect(fired[0].currentPrice).toBe(30000);
  });

  it('não dispara condition=below quando preço está acima do threshold', () => {
    // Given
    const items = [makeItem({ sellPrice: 70000 })];
    const alerts = [makeAlert({ condition: 'below', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(0);
  });

  it('dispara alerta condition=above quando preço está acima do threshold', () => {
    // Given
    const items = [makeItem({ sellPrice: 80000 })];
    const alerts = [makeAlert({ condition: 'above', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
  });

  it('não dispara condition=above quando preço está abaixo do threshold', () => {
    // Given
    const items = [makeItem({ sellPrice: 40000 })];
    const alerts = [makeAlert({ condition: 'above', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(0);
  });

  it('dispara alerta condition=change quando spreadPercent >= threshold', () => {
    // Given
    const items = [makeItem({ spreadPercent: 25 })];
    const alerts = [makeAlert({ condition: 'change', threshold: 20 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
  });

  it('não dispara condition=change quando spreadPercent < threshold', () => {
    // Given
    const items = [makeItem({ spreadPercent: 15 })];
    const alerts = [makeAlert({ condition: 'change', threshold: 20 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(0);
  });

  it('não dispara quando alerta está inativo (isActive: false)', () => {
    // Given
    const items = [makeItem({ sellPrice: 30000 })];
    const alerts = [makeAlert({ isActive: false, condition: 'below', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(0);
  });

  it('não dispara (e não crasha) quando item não é encontrado', () => {
    // Given
    const items = [makeItem({ itemId: 'OUTRO_ITEM' })];
    const alerts = [makeAlert({ itemId: 'ITEM_0001' })];

    // When / Then
    expect(() => checkAlerts(items, alerts)).not.toThrow();
    expect(checkAlerts(items, alerts)).toHaveLength(0);
  });

  it('retorna apenas os alertas que violam threshold entre múltiplos', () => {
    // Given
    const items = [
      makeItem({ itemId: 'ITEM_0001', sellPrice: 30000 }),
      makeItem({ itemId: 'ITEM_0002', itemName: 'Bloodletter', sellPrice: 90000, city: 'Bridgewatch' }),
    ];
    const alerts = [
      makeAlert({ id: 'a1', itemId: 'ITEM_0001', condition: 'below', threshold: 60000 }),
      makeAlert({ id: 'a2', itemId: 'ITEM_0002', city: 'Bridgewatch', condition: 'below', threshold: 50000 }), // não viola
    ];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
    expect(fired[0].alert.id).toBe('a1');
  });

  it('respeita filtro de cidade — não dispara quando cidade não bate', () => {
    // Given
    const items = [makeItem({ city: 'Bridgewatch', sellPrice: 30000 })];
    const alerts = [makeAlert({ city: 'Caerleon', condition: 'below', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(0);
  });

  it('dispara para "All Cities" independente da cidade do item', () => {
    // Given
    const items = [makeItem({ city: 'Bridgewatch', sellPrice: 30000 })];
    const alerts = [makeAlert({ city: 'All Cities', condition: 'below', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
  });
});
