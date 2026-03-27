import { AlertStorageService } from "./alert.storage";
import { MockMarketService } from "./market.mock";
import { ApiMarketService } from "./market.api";
import type { MarketService } from "./market.service";
import type { IAlertStorage } from "@/data/types";

export interface MarketServiceConfig {
  useRealApi?: boolean;
  storage?: IAlertStorage;
  fallback?: MarketService;
}

export function createMarketService(
  config: MarketServiceConfig = {},
): MarketService {
  const storage = config.storage ?? new AlertStorageService();

  if (config.useRealApi ?? import.meta.env.VITE_USE_REAL_API === "true") {
    const fallback = config.fallback ?? new MockMarketService(storage);
    return new ApiMarketService(storage, fallback);
  }

  return new MockMarketService(storage);
}
