import type { ArbitrageOpportunity, MarketItem } from '@/data/types';

export const MARKET_TAX_RATE = 0.065;

function buildOpportunity(
  buyItem: MarketItem,
  sellItem: MarketItem,
  feeRate: number
): ArbitrageOpportunity | null {
  if (buyItem.city === sellItem.city) return null;
  if (buyItem.sellPrice <= 0 || sellItem.buyPrice <= 0) return null;

  const netRevenue = Math.floor(sellItem.buyPrice * (1 - feeRate));
  const netProfit = netRevenue - buyItem.sellPrice;

  if (netProfit <= 0) return null;

  return {
    itemId: buyItem.itemId,
    itemName: buyItem.itemName,
    tier: buyItem.tier,
    quality: buyItem.quality,
    buyCity: buyItem.city,
    buyPrice: buyItem.sellPrice,
    sellCity: sellItem.city,
    sellPrice: sellItem.buyPrice,
    netProfit,
    netProfitPercent: (netProfit / buyItem.sellPrice) * 100,
    timestamp: sellItem.timestamp > buyItem.timestamp ? sellItem.timestamp : buyItem.timestamp,
  };
}

export function buildCrossCityArbitrage(
  items: MarketItem[],
  feeRate = MARKET_TAX_RATE
): ArbitrageOpportunity[] {
  const groups = new Map<string, MarketItem[]>();

  for (const item of items) {
    const key = `${item.itemId}|${item.quality}`;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const opportunities: ArbitrageOpportunity[] = [];

  for (const group of groups.values()) {
    let best: ArbitrageOpportunity | null = null;

    for (const buyItem of group) {
      for (const sellItem of group) {
        const opportunity = buildOpportunity(buyItem, sellItem, feeRate);
        if (!opportunity) continue;

        if (
          !best ||
          opportunity.netProfitPercent > best.netProfitPercent ||
          (
            opportunity.netProfitPercent === best.netProfitPercent &&
            opportunity.netProfit > best.netProfit
          )
        ) {
          best = opportunity;
        }
      }
    }

    if (best) {
      opportunities.push(best);
    }
  }

  return opportunities.sort((a, b) => {
    if (b.netProfitPercent === a.netProfitPercent) {
      return b.netProfit - a.netProfit;
    }
    return b.netProfitPercent - a.netProfitPercent;
  });
}
