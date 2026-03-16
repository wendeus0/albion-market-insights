import type { MarketItem, Alert } from '@/data/types';
import type { MarketService } from './market.service';
import { AlbionPriceRecordSchema, AlbionHistoryRecordSchema, albionRecordToMarketItem } from './market.api.types';
import { AlertStorageService } from './alert.storage';
import { ITEM_IDS, ITEM_NAMES } from '@/data/constants';
import { MockMarketService } from './market.mock';

const BASE_URL = 'https://west.albion-online-data.com/api/v2/stats/prices';
const HISTORY_URL = 'https://west.albion-online-data.com/api/v2/stats/history';

const LOCATIONS = [
  'Caerleon',
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Black Market',
] as const;

type Location = typeof LOCATIONS[number];

// Key: `${itemId}|${city}`, value: array of avg_prices ordered oldest→newest
type HistoryMap = Map<string, number[]>;

export class ApiMarketService implements MarketService {
  private storage = new AlertStorageService();
  private fallback = new MockMarketService();
  private cachedLastUpdate: string = new Date().toISOString();

  private async fetchHistoryForCity(city: Location): Promise<HistoryMap> {
    const map: HistoryMap = new Map();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const url = `${HISTORY_URL}/${ITEM_IDS.join(',')}.json?locations=${city}&qualities=1&time-scale=1`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`History API error: ${response.status}`);

      const raw: unknown[] = await response.json();

      for (const record of raw) {
        const result = AlbionHistoryRecordSchema.safeParse(record);
        if (!result.success || result.data.data.length === 0) continue;

        const sorted = [...result.data.data]
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
          .map(d => d.avg_price);

        map.set(`${result.data.item_id}|${result.data.location}`, sorted);
      }
    } catch {
      clearTimeout(timeoutId);
    }

    return map;
  }

  async getItems(): Promise<MarketItem[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const locationsParam = LOCATIONS.join(',');
      const url = `${BASE_URL}/${ITEM_IDS.join(',')}.json?locations=${locationsParam}&qualities=1,2,3,4,5`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Albion API error: ${response.status}`);
      }

      const raw: unknown[] = await response.json();
      this.cachedLastUpdate = new Date().toISOString();

      const items = raw
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

      // Enrich with price history (parallel requests per city, failures are silent)
      const historyMaps = await Promise.all(
        LOCATIONS.map(city => this.fetchHistoryForCity(city))
      );
      const merged: HistoryMap = new Map();
      for (const map of historyMaps) {
        for (const [key, prices] of map) merged.set(key, prices);
      }

      return items.map(item => {
        const history = merged.get(`${item.itemId}|${item.city}`);
        return history ? { ...item, priceHistory: history } : item;
      });
    } catch {
      clearTimeout(timeoutId);
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
