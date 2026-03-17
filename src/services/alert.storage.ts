import type { Alert } from '@/data/types';
import { alertSchema } from '@/lib/schemas';

const STORAGE_KEY = 'albion_alerts';

export class AlertStorageService {
  getAlerts(): Alert[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter((item): item is Alert => {
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
