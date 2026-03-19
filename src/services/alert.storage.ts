import type { Alert } from '@/data/types';
import { alertSchema } from '@/lib/schemas';

const STORAGE_KEY = 'albion_alerts';

/**
 * Migra dados antigos para o novo formato
 * - Converte "All Cities" para "all"
 */
function migrateAlertData(item: unknown): unknown {
  if (typeof item !== 'object' || item === null) return item;
  
  const alert = item as Record<string, unknown>;
  
  // Migração: "All Cities" -> "all"
  if (alert.city === 'All Cities') {
    alert.city = 'all';
  }
  
  return alert;
}

export class AlertStorageService {
  getAlerts(): Alert[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map(migrateAlertData) // Migra dados antigos
        .filter((item): item is Alert => {
          const result = alertSchema.safeParse(item);
          return result.success;
        });
    } catch {
      return [];
    }
  }

  saveAlert(alert: Alert): void {
    const alerts = this.getAlerts();
    const index = alerts.findIndex(a => a.id === alert.id);
    if (index >= 0) {
      alerts[index] = alert;
    } else {
      alerts.unshift(alert);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }

  deleteAlert(id: string): void {
    const alerts = this.getAlerts().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }
}
