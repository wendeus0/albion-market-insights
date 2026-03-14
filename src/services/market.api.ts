import type { MarketItem, Alert } from '@/data/types';
import type { MarketService } from './market.service';
import { AlbionPriceRecordSchema, albionRecordToMarketItem } from './market.api.types';
import { AlertStorageService } from './alert.storage';

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

const ITEM_IDS = [
  'T4_MAIN_SWORD',
  'T4_2H_SWORD',
  'T5_MAIN_SWORD',
  'T5_2H_SWORD',
  'T6_MAIN_SWORD',
  'T6_2H_SWORD',
  'T7_MAIN_SWORD',
  'T8_MAIN_SWORD',
  'T4_MAIN_SPEAR',
  'T5_MAIN_SPEAR',
  'T4_MAIN_DAGGER',
  'T5_MAIN_DAGGER',
  'T4_ARMOR_PLATE_SET1',
  'T5_ARMOR_PLATE_SET1',
  'T4_ARMOR_LEATHER_SET1',
  'T5_ARMOR_LEATHER_SET1',
  'T4_ARMOR_CLOTH_SET1',
  'T5_ARMOR_CLOTH_SET1',
  'T4_HEAD_PLATE_SET1',
  'T5_HEAD_PLATE_SET1',
].join(',');

export class ApiMarketService implements MarketService {
  private storage = new AlertStorageService();
  private cachedLastUpdate: string = new Date().toISOString();

  async getItems(): Promise<MarketItem[]> {
    const url = `${BASE_URL}/${ITEM_IDS}.json?locations=${LOCATIONS}&qualities=1,2,3,4,5`;
    const response = await fetch(url);
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
      .filter(item => item.sellPrice > 0 && item.buyPrice > 0);
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
