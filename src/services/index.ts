import type { MarketService } from "./market.service";
import { createMarketService } from "./factory";

export type { MarketService };
export { createMarketService } from "./factory";
export const marketService: MarketService = createMarketService();
