import { z } from 'zod';
import type { MarketItem } from '@/data/types';

export const CACHE_KEY = 'albion_market_cache';
export const CACHE_TTL_MS = 300_000; // 5 minutes

const MarketItemCacheSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  city: z.string(),
  sellPrice: z.number(),
  buyPrice: z.number(),
  spread: z.number(),
  spreadPercent: z.number(),
  timestamp: z.string(),
  tier: z.string(),
  quality: z.string(),
  priceHistory: z.array(z.number()),
});

const MarketCacheEntrySchema = z.object({
  data: z.array(MarketItemCacheSchema),
  cachedAt: z.string(),
  expiresAt: z.string(),
});

export type MarketCacheEntry = z.infer<typeof MarketCacheEntrySchema>;

export function readCache(): MarketCacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const result = MarketCacheEntrySchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}

export function writeCache(data: MarketItem[]): void {
  const now = new Date();
  const entry: MarketCacheEntry = {
    data,
    cachedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // QuotaExceededError or other storage errors — silently skip caching
  }
}

export function isCacheValid(entry: MarketCacheEntry): boolean {
  return new Date(entry.expiresAt).getTime() > Date.now();
}
