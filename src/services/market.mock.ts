import { mockItems, lastUpdateTime } from '@/data/mockData';
import type { MarketItem, Alert } from '@/data/types';
import type { MarketService } from './market.service';
import { AlertStorageService } from './alert.storage';
import { mockAlerts } from '@/data/mockData';

export class MockMarketService implements MarketService {
  private storage = new AlertStorageService();

  constructor() {
    // Seed localStorage com mockAlerts se ainda não houver dados
    if (this.storage.getAlerts().length === 0) {
      for (const alert of mockAlerts) {
        this.storage.saveAlert(alert);
      }
    }
  }

  async getItems(): Promise<MarketItem[]> {
    return [...mockItems];
  }

  async getTopProfitable(limit = 5): Promise<MarketItem[]> {
    return mockItems.slice(0, limit);
  }

  async getLastUpdateTime(): Promise<string> {
    return lastUpdateTime;
  }

  async getAlerts(): Promise<Alert[]> {
    return this.storage.getAlerts();
  }

  async saveAlert(alert: Alert): Promise<void> {
    this.storage.saveAlert(alert);
  }

  async deleteAlert(id: string): Promise<void> {
    this.storage.deleteAlert(id);
  }
}
