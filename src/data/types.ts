export interface IAlertStorage {
  getAlerts(): Alert[] | Promise<Alert[]>;
  saveAlert(alert: Alert): void | Promise<void>;
  deleteAlert(id: string): void | Promise<void>;
}

export interface UserProfile {
  id: string;
  discordId: string | null;
  discordUsername: string | null;
  discordDmEnabled: boolean;
  discordWebhookUrl: string | null;
  updatedAt: string;
}

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

export interface ArbitrageOpportunity {
  itemId: string;
  itemName: string;
  tier: string;
  quality: string;
  buyCity: string;
  buyPrice: number;
  sellCity: string;
  sellPrice: number;
  netProfit: number;
  netProfitPercent: number;
  timestamp: string;
}

export interface Alert {
  id: string;
  itemId: string;
  itemName: string;
  quality: string;
  city: string;
  condition: "below" | "above" | "change";
  threshold: number;
  isActive: boolean;
  createdAt: string;
  notifications: {
    inApp: boolean;
    email: boolean;
  };
}
