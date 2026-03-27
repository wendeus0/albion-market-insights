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
    quality: 'Normal',
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

  it('dispara alerta condition=change quando variação temporal >= threshold', () => {
    // Given - preço subiu de 40000 para 50000 (25% de variação)
    const items = [makeItem({ 
      sellPrice: 50000,
      priceHistory: [40000, 45000, 48000] // baseline: 40000
    })];
    const alerts = [makeAlert({ condition: 'change', threshold: 20 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
    expect(fired[0].priceChangePercent).toBe(25);
  });

  it('não dispara condition=change quando variação temporal < threshold', () => {
    // Given - preço subiu de 48000 para 50000 (4.17% de variação)
    const items = [makeItem({ 
      sellPrice: 50000,
      priceHistory: [48000, 49000] // baseline: 48000
    })];
    const alerts = [makeAlert({ condition: 'change', threshold: 20 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(0);
  });

  it('dispara alerta condition=change quando variação negativa >= threshold', () => {
    // Given - preço caiu de 60000 para 40000 (-33.33% de variação)
    const items = [makeItem({ 
      sellPrice: 40000,
      priceHistory: [60000, 55000, 50000] // baseline: 60000
    })];
    const alerts = [makeAlert({ condition: 'change', threshold: 30 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
    expect(fired[0].priceChangePercent).toBeCloseTo(-33.33, 1);
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

  it('não dispara quando notificação inApp está desabilitada', () => {
    // Given
    const items = [makeItem({ sellPrice: 30000 })];
    const alerts = [makeAlert({ 
      condition: 'below', 
      threshold: 60000,
      notifications: { inApp: false, email: false }
    })];

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

  it('não mistura variantes com quality diferente', () => {
    const items = [makeItem({ quality: 'Excellent', sellPrice: 30000 })];
    const alerts = [makeAlert({ quality: 'Normal', condition: 'below', threshold: 60000 })];

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

  it('dispara para "all" (todas as cidades) independente da cidade do item', () => {
    // Given
    const items = [makeItem({ city: 'Bridgewatch', sellPrice: 30000 })];
    const alerts = [makeAlert({ city: 'all', condition: 'below', threshold: 60000 })];

    // When
    const fired = checkAlerts(items, alerts);

    // Then
    expect(fired).toHaveLength(1);
  });
});
