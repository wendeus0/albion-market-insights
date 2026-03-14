import { cities, tiers, qualities } from '@/data/constants';
import type { MarketItem, Alert } from '@/data/types';

export { cities, tiers, qualities };
export type { MarketItem, Alert };

const itemNames = [
  'Clarent Blade',
  'Carving Sword',
  'Bloodletter',
  'Black Hands',
  'Deathgivers',
  'Cleric Robe',
  'Mage Robe',
  'Assassin Jacket',
  'Hunter Hood',
  'Soldier Helmet',
  'Guardian Boots',
  'Mercenary Jacket',
  'Knight Armor',
  'Druid Robe',
  'Stalker Hood',
  'Fiend Cowl',
  'Graveguard Helmet',
  'Royal Sandals',
  'Hellion Shoes',
  'Cultist Robe',
];

function generatePriceHistory(): number[] {
  const base = Math.floor(Math.random() * 50000) + 10000;
  return Array.from({ length: 7 }, () => 
    Math.floor(base + (Math.random() - 0.5) * base * 0.3)
  );
}

function generateTimestamp(): string {
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 30);
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now.toISOString();
}

export function generateMockItems(count: number = 50): MarketItem[] {
  const items: MarketItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const sellPrice = Math.floor(Math.random() * 100000) + 5000;
    const buyPrice = Math.floor(sellPrice * (0.7 + Math.random() * 0.25));
    const spread = sellPrice - buyPrice;
    const spreadPercent = ((spread / buyPrice) * 100);
    
    items.push({
      itemId: `ITEM_${i.toString().padStart(4, '0')}`,
      itemName: itemNames[Math.floor(Math.random() * itemNames.length)],
      city: cities[Math.floor(Math.random() * cities.length)],
      sellPrice,
      buyPrice,
      spread,
      spreadPercent,
      timestamp: generateTimestamp(),
      tier: tiers[Math.floor(Math.random() * tiers.length)],
      quality: qualities[Math.floor(Math.random() * qualities.length)],
      priceHistory: generatePriceHistory(),
    });
  }
  
  return items.sort((a, b) => b.spreadPercent - a.spreadPercent);
}

export const mockItems = generateMockItems(100);

export const mockAlerts: Alert[] = [
  {
    id: '1',
    itemId: 'ITEM_0001',
    itemName: 'Bloodletter',
    city: 'Caerleon',
    condition: 'below',
    threshold: 25000,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    notifications: { inApp: true, email: false },
  },
  {
    id: '2',
    itemId: 'ITEM_0005',
    itemName: 'Cleric Robe',
    city: 'All Cities',
    condition: 'above',
    threshold: 80000,
    isActive: true,
    createdAt: '2024-01-14T15:45:00Z',
    notifications: { inApp: true, email: true },
  },
  {
    id: '3',
    itemId: 'ITEM_0010',
    itemName: 'Guardian Boots',
    city: 'Bridgewatch',
    condition: 'change',
    threshold: 15,
    isActive: false,
    createdAt: '2024-01-10T08:00:00Z',
    notifications: { inApp: false, email: true },
  },
];

export const topProfitableItems = mockItems.slice(0, 5);

export const lastUpdateTime = new Date().toISOString();
