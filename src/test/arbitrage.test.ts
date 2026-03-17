import { describe, it, expect } from 'vitest';
import type { MarketItem } from '@/data/types';
import { buildCrossCityArbitrage, MARKET_TAX_RATE } from '@/lib/arbitrage';

const baseTimestamp = '2026-03-17T10:00:00.000Z';

function makeItem(overrides: Partial<MarketItem>): MarketItem {
  return {
    itemId: 'T8_2H_HOLYSTAFF_HELL@3',
    itemName: 'Great Holy Staff T8 .3',
    city: 'Martlock',
    sellPrice: 5_900_000,
    buyPrice: 1,
    spread: 5_899_999,
    spreadPercent: 589999900,
    timestamp: baseTimestamp,
    tier: 'T8',
    quality: 'Good',
    priceHistory: [5_700_000, 5_800_000, 5_900_000],
    ...overrides,
  };
}

describe('buildCrossCityArbitrage', () => {
  it('deve expor taxa de mercado fixa de 6.5%', () => {
    expect(MARKET_TAX_RATE).toBe(0.065);
  });

  it('deve montar oportunidade com menor sell price e maior buy price em cidade diferente', () => {
    const opportunities = buildCrossCityArbitrage([
      makeItem({ city: 'Martlock', sellPrice: 5_900_000, buyPrice: 1 }),
      makeItem({ city: 'Caerleon', sellPrice: 7_500_000, buyPrice: 7_200_000 }),
      makeItem({ city: 'Bridgewatch', sellPrice: 6_300_000, buyPrice: 6_100_000 }),
    ]);

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0]).toMatchObject({
      buyCity: 'Martlock',
      sellCity: 'Caerleon',
      buyPrice: 5_900_000,
      sellPrice: 7_200_000,
      netProfit: 832_000,
    });
  });

  it('deve excluir oportunidades com lucro liquido menor ou igual a zero', () => {
    const opportunities = buildCrossCityArbitrage([
      makeItem({ itemId: 'T6_MAIN_AXE', itemName: 'Battleaxe T6', tier: 'T6', quality: 'Normal', city: 'Bridgewatch', sellPrice: 100_000, buyPrice: 90_000 }),
      makeItem({ itemId: 'T6_MAIN_AXE', itemName: 'Battleaxe T6', tier: 'T6', quality: 'Normal', city: 'Thetford', sellPrice: 110_000, buyPrice: 100_000 }),
    ]);

    expect(opportunities).toEqual([]);
  });

  it('deve ordenar oportunidades por maior percentual de lucro liquido', () => {
    const opportunities = buildCrossCityArbitrage([
      makeItem({ itemId: 'T8_2H_HOLYSTAFF_HELL@3', itemName: 'Great Holy Staff T8 .3', city: 'Martlock', sellPrice: 5_900_000, buyPrice: 1 }),
      makeItem({ itemId: 'T8_2H_HOLYSTAFF_HELL@3', itemName: 'Great Holy Staff T8 .3', city: 'Caerleon', sellPrice: 7_500_000, buyPrice: 7_200_000 }),
      makeItem({ itemId: 'T5_MAIN_SWORD', itemName: 'Broadsword T5', tier: 'T5', quality: 'Normal', city: 'Lymhurst', sellPrice: 50_000, buyPrice: 40_000 }),
      makeItem({ itemId: 'T5_MAIN_SWORD', itemName: 'Broadsword T5', tier: 'T5', quality: 'Normal', city: 'Bridgewatch', sellPrice: 60_000, buyPrice: 70_000 }),
    ]);

    expect(opportunities).toHaveLength(2);
    expect(opportunities[0].itemId).toBe('T5_MAIN_SWORD');
    expect(opportunities[0].netProfitPercent).toBeGreaterThan(opportunities[1].netProfitPercent);
  });
});
