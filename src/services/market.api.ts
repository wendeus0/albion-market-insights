import type { MarketItem, Alert } from '@/data/types';
import type { MarketService } from './market.service';
import { AlbionPriceRecordSchema, AlbionHistoryRecordSchema, albionRecordToMarketItem } from './market.api.types';
import type { AlbionPriceRecord } from './market.api.types';
import { AlertStorageService } from './alert.storage';
import { ITEM_IDS, ITEM_NAMES } from '@/data/constants';
import { MockMarketService } from './market.mock';
import { readCache, writeCache, isCacheValid } from '@/services/market.cache';
import { dataSourceManager, shouldUseMockFallback } from './dataSource.manager';

const BASE_URL = 'https://west.albion-online-data.com/api/v2/stats/prices';
const HISTORY_URL = 'https://west.albion-online-data.com/api/v2/stats/history';

export const BATCH_SIZE = 100;
export const HISTORY_CONCURRENCY = 3;
export const RETRY_MAX_ATTEMPTS = 3;
export const RETRY_BASE_DELAY_MS = 500;

function isRetryable(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: { maxAttempts?: number; baseDelayMs?: number }
): Promise<Response> {
  const maxAttempts = retryConfig?.maxAttempts ?? RETRY_MAX_ATTEMPTS;
  const baseDelayMs = retryConfig?.baseDelayMs ?? RETRY_BASE_DELAY_MS;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    if (options?.signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    let response: Response | undefined;
    try {
      response = await fetch(url, options);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      lastError = err;
    }

    if (response) {
      if (response.ok) return response;
      if (!isRetryable(response.status)) throw new Error(`HTTP ${response.status}`);
      lastError = new Error(`HTTP ${response.status}`);
    }

    if (attempt < maxAttempts) {
      const jitter = Math.floor(Math.random() * 100);
      await delay(baseDelayMs * Math.pow(2, attempt) + jitter);
    }
  }

  throw lastError;
}

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

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export class ApiMarketService implements MarketService {
  private storage = new AlertStorageService();
  private fallback = new MockMarketService();
  private cachedLastUpdate: string | null = null;
  private hasSuccessfulFetch = false;

  private async fetchPricesBatch(itemIds: string[], signal?: AbortSignal): Promise<AlbionPriceRecord[]> {
    const locationsParam = LOCATIONS.join(',');
    const url = `${BASE_URL}/${itemIds.join(',')}.json?locations=${locationsParam}&qualities=1,2,3,4,5`;
    const response = await fetchWithRetry(url, { signal });
    const raw: unknown[] = await response.json();
    return raw
      .map(r => {
        const result = AlbionPriceRecordSchema.safeParse(r);
        return result.success ? result.data : null;
      })
      .filter((r): r is AlbionPriceRecord => r !== null);
  }

  private async fetchHistoryBatch(itemIds: string[], city: Location): Promise<HistoryMap> {
    const map: HistoryMap = new Map();
    try {
      const url = `${HISTORY_URL}/${itemIds.join(',')}.json?locations=${city}&qualities=1&time-scale=1`;
      const response = await fetchWithRetry(url);
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
      // silent — history enrichment is best-effort
    }
    return map;
  }

  private async buildHistoryMap(batches: string[][]): Promise<HistoryMap> {
    const merged: HistoryMap = new Map();
    const tasks = batches.flatMap(batch =>
      LOCATIONS.map(city => async () => this.fetchHistoryBatch(batch, city))
    );
    const batchMaps = await withConcurrency(tasks, HISTORY_CONCURRENCY);
    for (const batchMap of batchMaps) {
      for (const [key, prices] of batchMap) {
        merged.set(key, prices);
      }
    }
    return merged;
  }

  async getItems(): Promise<MarketItem[]> {
    const cached = readCache();
    if (cached && isCacheValid(cached)) {
      this.cachedLastUpdate = cached.cachedAt;
      this.hasSuccessfulFetch = true;
      dataSourceManager.setReal();
      return cached.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const batches = chunkArray(ITEM_IDS, BATCH_SIZE);

      const priceTasks = batches.map(batch => async () => {
        if (controller.signal.aborted) return [] as AlbionPriceRecord[];
        try {
          return await this.fetchPricesBatch(batch, controller.signal);
        } catch {
          return [] as AlbionPriceRecord[];
        }
      });

      const batchResults = await withConcurrency(priceTasks, 3);
      clearTimeout(timeoutId);

      // Deduplicate across batches (first occurrence wins)
      const seen = new Set<string>();
      const allPriceRecords = batchResults.flat().filter(r => {
        const key = `${r.item_id}|${r.city}|${r.quality}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (allPriceRecords.length === 0) {
        // Nenhum dado retornado da API
        if (shouldUseMockFallback()) {
          dataSourceManager.setMock();
          return this.fallback.getItems();
        } else {
          dataSourceManager.setDegraded('API retornou dados vazios');
          throw new Error('API returned empty data');
        }
      }

      this.cachedLastUpdate = new Date().toISOString();
      this.hasSuccessfulFetch = true;
      dataSourceManager.setReal();

      const items = allPriceRecords
        .map(record => albionRecordToMarketItem(record))
        .filter(item => item.sellPrice > 0 && item.buyPrice > 0)
        .map(item => ({
          ...item,
          itemName: ITEM_NAMES[item.itemId] ?? item.itemName,
        }));

      const historyMap = await this.buildHistoryMap(batches);

      const result = items.map(item => {
        const history = historyMap.get(`${item.itemId}|${item.city}`);
        return history ? { ...item, priceHistory: history } : item;
      });

      writeCache(result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (shouldUseMockFallback()) {
        dataSourceManager.setMock();
        return this.fallback.getItems();
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        dataSourceManager.setDegraded(errorMessage);
        throw error;
      }
    }
  }

  async getTopProfitable(limit = 5): Promise<MarketItem[]> {
    const items = await this.getItems();
    return [...items]
      .sort((a, b) => b.spreadPercent - a.spreadPercent)
      .slice(0, limit);
  }

  async getLastUpdateTime(): Promise<string | null> {
    return this.hasSuccessfulFetch ? this.cachedLastUpdate : null;
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
