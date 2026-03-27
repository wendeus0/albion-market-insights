import { mockItems, lastUpdateTime } from "@/data/mockData";
import type { MarketItem, Alert, IAlertStorage } from "@/data/types";
import type { MarketService } from "./market.service";
import { AlertStorageService } from "./alert.storage";
import { dataSourceManager } from "./dataSource.manager";

export class MockMarketService implements MarketService {
  constructor(
    private storage: IAlertStorage = new AlertStorageService(),
  ) {}

  setStorage(storage: IAlertStorage): void {
    this.storage = storage;
  }

  async getItems(): Promise<MarketItem[]> {
    dataSourceManager.setMock();
    return [...mockItems];
  }

  async getTopProfitable(limit = 5): Promise<MarketItem[]> {
    return mockItems.slice(0, limit);
  }

  async getLastUpdateTime(): Promise<string | null> {
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
