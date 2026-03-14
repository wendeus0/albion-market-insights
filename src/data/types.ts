export interface MarketItem {
  itemId: string;
  itemName: string;
  city: string;
  sellPrice: number;
  buyPrice: number;
  spread: number;
  spreadPercent: number;
  timestamp: string;
  tier: string;
  quality: string;
  priceHistory: number[];
}

export interface Alert {
  id: string;
  itemId: string;
  itemName: string;
  city: string;
  condition: 'below' | 'above' | 'change';
  threshold: number;
  isActive: boolean;
  createdAt: string;
  notifications: {
    inApp: boolean;
    email: boolean;
  };
}
