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

    for (const { alert, item, currentPrice } of fired) {
      // Respeitar preferência de notificação inApp do usuário
      if (!alert.notifications?.inApp) continue;

      const lastTime = lastFiredAt.current[alert.id] ?? 0;
      if (now - lastTime < NOTIFICATION_COOLDOWN_MS) continue;

      lastFiredAt.current[alert.id] = now;

      const conditionText =
        alert.condition === 'below'
          ? `abaixo de ${alert.threshold.toLocaleString()}`
          : alert.condition === 'above'
            ? `acima de ${alert.threshold.toLocaleString()}`
            : `variação ≥ ${alert.threshold}%`;

      toast.warning(`⚠️ ${item.itemName} — preço ${conditionText}`, {
        description: `Preço atual: ${currentPrice.toLocaleString()} em ${item.city}`,
        duration: 8000,
      });
    }
  }, [items, alerts]);
}
