import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useMarketItems } from '@/hooks/useMarketItems';
import { useAlerts } from '@/hooks/useAlerts';
import { checkAlerts } from '@/services/alert.engine';

const NOTIFICATION_COOLDOWN_MS = 60 * 60 * 1000; // 60 minutos

export function useAlertPoller() {
  const { data: items = [] } = useMarketItems({ refetchInterval: 15 * 60 * 1000 });
  const { data: alerts = [] } = useAlerts();

  // Rastreia última notificação por alertId para evitar spam na mesma sessão
  const lastFiredAt = useRef<Record<string, number>>({});

  useEffect(() => {
    if (items.length === 0 || alerts.length === 0) return;

    const fired = checkAlerts(items, alerts);
    const now = Date.now();

    for (const { alert, item, currentPrice, priceChangePercent } of fired) {
      const lastTime = lastFiredAt.current[alert.id] ?? 0;
      if (now - lastTime < NOTIFICATION_COOLDOWN_MS) continue;

      lastFiredAt.current[alert.id] = now;

      let conditionText: string;
      let description: string;

      if (alert.condition === 'below') {
        conditionText = `abaixo de ${alert.threshold.toLocaleString()}`;
        description = `Preço atual: ${currentPrice.toLocaleString()} em ${item.city}`;
      } else if (alert.condition === 'above') {
        conditionText = `acima de ${alert.threshold.toLocaleString()}`;
        description = `Preço atual: ${currentPrice.toLocaleString()} em ${item.city}`;
      } else {
        // Condição 'change' - variação percentual temporal
        const changeText = priceChangePercent !== undefined 
          ? `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(1)}%`
          : 'N/A';
        conditionText = `variação de ${changeText}`;
        description = `Variação detectada: ${changeText} (limite: ${alert.threshold}%)`;
      }

      toast.warning(`⚠️ ${item.itemName} — ${conditionText}`, {
        description,
        duration: 8000,
      });
    }
  }, [items, alerts]);
}
