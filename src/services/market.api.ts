import type { MarketItem, Alert } from '@/data/types';
import type { MarketService } from './market.service';
import { AlbionPriceRecordSchema, albionRecordToMarketItem } from './market.api.types';
import { AlertStorageService } from './alert.storage';
import { ITEM_IDS, ITEM_NAMES } from '@/data/constants';
import { MockMarketService } from './market.mock';

const BASE_URL = 'https://west.albion-online-data.com/api/v2/stats/prices';

const LOCATIONS = [
  'Caerleon',
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Black Market',
].join(',');

export class ApiMarketService implements MarketService {
  private storage = new AlertStorageService();
  private fallback = new MockMarketService();
  private cachedLastUpdate: string = new Date().toISOString();

  async getItems(): Promise<MarketItem[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const url = `${BASE_URL}/${ITEM_IDS.join(',')}.json?locations=${LOCATIONS}&qualities=1,2,3,4,5`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Albion API error: ${response.status}`);
      }

      const raw: unknown[] = await response.json();
      this.cachedLastUpdate = new Date().toISOString();

      return raw
        .map(record => {
          const result = AlbionPriceRecordSchema.safeParse(record);
          return result.success ? albionRecordToMarketItem(result.data) : null;
        })
        .filter((item): item is MarketItem => item !== null)
        .filter(item => item.sellPrice > 0 && item.buyPrice > 0)
        .map(item => ({
          ...item,
          itemName: ITEM_NAMES[item.itemId] ?? item.itemName,
        }));
    } catch {
      clearTimeout(timeoutId);
      console.warn('[ApiMarketService] API indisponível, usando mock data');
      return this.fallback.getItems();
    }
  }

  async getTopProfitable(limit = 5): Promise<MarketItem[]> {
    const items = await this.getItems();
    return [...items]
      .sort((a, b) => b.spreadPercent - a.spreadPercent)
      .slice(0, limit);
  }

  async getLastUpdateTime(): Promise<string> {
    return this.cachedLastUpdate;
  }

  async getAlerts(): Promise<Alert[]> {
    return this.storage.getAlerts();
  }

  async saveAlert(alert: Alert): Promise<void> {
    return this.storage.saveAlert(alert);
  }

  async deleteAlert(id: string): Promise<void> {
    return this.storage.deleteAlert(id);
  }
}
