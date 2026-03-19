import type { MarketItem, Alert } from '@/data/types';

export interface FiredAlert {
  alert: Alert;
  item: MarketItem;
  currentPrice: number;
  priceChangePercent?: number;
}

/**
 * Calcula a variação percentual de preço ao longo do tempo.
 * Usa o histórico de preços para determinar a variação.
 * @returns Variação percentual (ex: 5.5 para +5.5%, -3.2 para -3.2%)
 */
function calculatePriceChangePercent(item: MarketItem): number {
  if (!item.priceHistory || item.priceHistory.length < 2) {
    return 0;
  }

  const currentPrice = item.sellPrice;
  // Usa o preço mais antigo do histórico como baseline
  const baselinePrice = item.priceHistory[0];
  
  if (baselinePrice === 0) return 0;
  
  return ((currentPrice - baselinePrice) / baselinePrice) * 100;
}

export function checkAlerts(items: MarketItem[], alerts: Alert[]): FiredAlert[] {
  const fired: FiredAlert[] = [];

  for (const alert of alerts) {
    if (!alert.isActive) continue;
    if (!alert.notifications?.inApp) continue;

    const item = items.find(
      i =>
        i.itemId === alert.itemId &&
        (alert.city === 'all' || i.city === alert.city),
    );
    if (!item) continue;

    const price = item.sellPrice;
    let triggered = false;
    let priceChangePercent: number | undefined;

    if (alert.condition === 'below') {
      triggered = price < alert.threshold;
    } else if (alert.condition === 'above') {
      triggered = price > alert.threshold;
    } else if (alert.condition === 'change') {
      // Variação percentual temporal (não spreadPercent)
      priceChangePercent = calculatePriceChangePercent(item);
      // Dispara quando a variação absoluta é maior ou igual ao threshold
      triggered = Math.abs(priceChangePercent) >= alert.threshold;
    }

    if (triggered) {
      fired.push({ 
        alert, 
        item, 
        currentPrice: price,
        priceChangePercent,
      });
    }
  }

  return fired;
}
