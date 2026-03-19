import type { MarketItem, Alert } from '@/data/types';

export interface FiredAlert {
  alert: Alert;
  item: MarketItem;
  currentPrice: number;
}

export function checkAlerts(items: MarketItem[], alerts: Alert[]): FiredAlert[] {
  const fired: FiredAlert[] = [];

  for (const alert of alerts) {
    if (!alert.isActive) continue;

    const item = items.find(
      i =>
        i.itemId === alert.itemId &&
        (alert.city === 'all' || i.city === alert.city),
    );
    if (!item) continue;

    const price = item.sellPrice;
    const triggered =
      (alert.condition === 'below' && price < alert.threshold) ||
      (alert.condition === 'above' && price > alert.threshold) ||
      (alert.condition === 'change' && item.spreadPercent >= alert.threshold);

    if (triggered) {
      fired.push({ alert, item, currentPrice: price });
    }
  }

  return fired;
}
