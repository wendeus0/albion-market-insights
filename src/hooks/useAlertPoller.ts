import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useMarketItems } from "@/hooks/useMarketItems";
import { useAlerts } from "@/hooks/useAlerts";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/useAuth";
import { checkAlerts } from "@/services/alert.engine";
import {
  recordDiscordAlertTrigger,
  sendDiscordWebhook,
} from "@/services/alert.notifications";
import { DATA_FRESHNESS_MS } from "@/data/constants";

const NOTIFICATION_COOLDOWN_MS = 60 * 60 * 1000; // 60 minutos entre notificações do mesmo alerta
const LAST_FIRED_STORAGE_KEY = "albion_alerts_last_fired";

/**
 * Carrega o estado do último disparo do localStorage
 * Limpa entradas expiradas (mais de 60 minutos)
 */
function loadLastFiredFromStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LAST_FIRED_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, number>;
    const now = Date.now();
    const valid: Record<string, number> = {};

    // Só mantém entradas que ainda estão no cooldown (últimos 60 min)
    for (const [alertId, timestamp] of Object.entries(parsed)) {
      if (now - timestamp < NOTIFICATION_COOLDOWN_MS) {
        valid[alertId] = timestamp;
      }
    }

    return valid;
  } catch {
    return {};
  }
}

/**
 * Salva o estado do último disparo no localStorage
 */
function saveLastFiredToStorage(lastFired: Record<string, number>): void {
  try {
    localStorage.setItem(LAST_FIRED_STORAGE_KEY, JSON.stringify(lastFired));
  } catch {
    // Ignora erros de localStorage (ex: quota exceeded)
  }
}

export function useAlertPoller() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: items = [] } = useMarketItems({
    refetchInterval: DATA_FRESHNESS_MS,
  });
  const { data: alerts = [] } = useAlerts();

  // Rastreia última notificação por alertId (carrega do localStorage)
  const lastFiredAt = useRef<Record<string, number>>(
    loadLastFiredFromStorage(),
  );

  useEffect(() => {
    if (items.length === 0 || alerts.length === 0) return;

    const fired = checkAlerts(items, alerts);
    const now = Date.now();

    for (const { alert, item, currentPrice, priceChangePercent } of fired) {
      const lastTime = lastFiredAt.current[alert.id] ?? 0;
      if (now - lastTime < NOTIFICATION_COOLDOWN_MS) continue;

      lastFiredAt.current[alert.id] = now;
      saveLastFiredToStorage(lastFiredAt.current); // Persiste no localStorage

      let conditionText: string;
      let description: string;

      if (alert.condition === "below") {
        conditionText = `abaixo de ${alert.threshold.toLocaleString()}`;
        description = `Preço atual: ${currentPrice.toLocaleString()} em ${item.city}`;
      } else if (alert.condition === "above") {
        conditionText = `acima de ${alert.threshold.toLocaleString()}`;
        description = `Preço atual: ${currentPrice.toLocaleString()} em ${item.city}`;
      } else {
        // Condição 'change' - variação percentual temporal
        const changeText =
          priceChangePercent !== undefined
            ? `${priceChangePercent >= 0 ? "+" : ""}${priceChangePercent.toFixed(1)}%`
            : "N/A";
        conditionText = `variação de ${changeText}`;
        description = `Variação detectada: ${changeText} (limite: ${alert.threshold}%)`;
      }

      toast.warning(`⚠️ ${item.itemName} — ${conditionText}`, {
        description,
        duration: 8000,
      });

      if (!user) continue;

      if (profile?.discordDmEnabled && profile.discordId) {
        void recordDiscordAlertTrigger(alert.id).catch(() => {
          console.error("Falha ao registrar alerta para envio por DM.");
        });
        continue;
      }

      if (profile?.discordWebhookUrl) {
        void sendDiscordWebhook(
          profile.discordWebhookUrl,
          alert,
          item,
          currentPrice,
          priceChangePercent,
        ).catch(() => {
          console.error("Falha ao enviar notificacao via webhook do Discord.");
        });
      }
    }
  }, [items, alerts, profile, user]);
}
