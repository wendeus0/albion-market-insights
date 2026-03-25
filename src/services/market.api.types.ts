import { z } from "zod";
import type { MarketItem } from "@/data/types";
import { ITEM_NAMES } from "@/data/constants";

export const AlbionHistoryEntrySchema = z.object({
  item_count: z.number(),
  avg_price: z.number(),
  timestamp: z.string(),
});

export const AlbionHistoryRecordSchema = z.object({
  item_id: z.string(),
  location: z.string(),
  quality: z.number().int().min(1).max(5),
  data: z.array(AlbionHistoryEntrySchema),
});

export type AlbionHistoryRecord = z.infer<typeof AlbionHistoryRecordSchema>;

export const AlbionPriceRecordSchema = z.object({
  item_id: z.string(),
  city: z.string(),
  quality: z.number().int().min(1).max(5),
  sell_price_min: z.number(),
  sell_price_min_date: z.string(),
  buy_price_max: z.number(),
  buy_price_max_date: z.string(),
});

export type AlbionPriceRecord = z.infer<typeof AlbionPriceRecordSchema>;

const qualityMap: Record<number, string> = {
  1: "Normal",
  2: "Good",
  3: "Outstanding",
  4: "Excellent",
  5: "Masterpiece",
};

export function albionRecordToMarketItem(
  record: AlbionPriceRecord,
): MarketItem {
  const sellPrice = record.sell_price_min;
  const buyPrice = record.buy_price_max;
  const spread = Math.max(0, sellPrice - buyPrice);
  const spreadPercent = buyPrice > 0 ? (spread / buyPrice) * 100 : 0;

  // Tier extraído do item_id (ex: T4_MAIN_SWORD → T4)
  const tierMatch = record.item_id.match(/^(T\d)/);
  const tier = tierMatch ? tierMatch[1] : "T4";

  // Usa ITEM_NAMES se disponível, ou cria nome limpo sem sufixo de encantamento
  const itemName =
    ITEM_NAMES[record.item_id] ??
    record.item_id.replace(/@\d$/, "").replace(/^T\d_/, "").replace(/_/g, " ");

  return {
    itemId: record.item_id,
    itemName,
    city: record.city,
    sellPrice,
    buyPrice,
    spread,
    spreadPercent,
    timestamp: record.sell_price_min_date || new Date().toISOString(),
    tier,
    quality: qualityMap[record.quality] || "Normal",
    priceHistory: [sellPrice],
  };
}
