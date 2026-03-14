import type { MarketService } from './market.service';
import { MockMarketService } from './market.mock';
import { ApiMarketService } from './market.api';

export type { MarketService };

export const marketService: MarketService =
  import.meta.env.VITE_USE_REAL_API === 'true'
    ? new ApiMarketService()
    : new MockMarketService();
