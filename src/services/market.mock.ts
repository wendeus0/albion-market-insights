import { mockItems, lastUpdateTime } from '@/data/mockData';
import type { MarketItem, Alert } from '@/data/types';
import type { MarketService } from './market.service';
import { AlertStorageService } from './alert.storage';

export class MockMarketService implements MarketService {
  private storage = new AlertStorageService();

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
