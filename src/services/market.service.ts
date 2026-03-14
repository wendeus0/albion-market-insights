import type { MarketItem, Alert } from '@/data/types';

export interface MarketService {
  getItems(): Promise<MarketItem[]>;
  getTopProfitable(limit?: number): Promise<MarketItem[]>;
  getLastUpdateTime(): Promise<string>;
  getAlerts(): Promise<Alert[]>;
  saveAlert(alert: Alert): Promise<void>;
  deleteAlert(id: string): Promise<void>;
}
