/**
 * Redemption Catalog Service
 * Manages redeemable items with location-based pricing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RedemptionItem {
  id: string;
  name: string;
  category: 'gaming' | 'entertainment' | 'shopping' | 'gift-card' | 'donation';
  description: string;
  icon: string;
  basePoints: number;
  regionalPricing: Record<string, number>; // Region -> points
  value: number; // USD value
  valueCurrency: string;
  inStock: boolean;
  expiresAt?: string;
  image?: string;
  url?: string;
}

export interface UserLocation {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  ip?: string;
}

const REDEMPTION_ITEMS: RedemptionItem[] = [
  {
    id: 'roblox-10',
    name: 'Roblox $10 Gift Card',
    category: 'gaming',
    description: 'Spend on Roblox games and items',
    icon: '🎮',
    basePoints: 91000,
    regionalPricing: {
      'US': 91000,
      'CA': 100000,
      'GB': 85000,
      'AU': 120000,
      'IN': 750000,
      'BR': 450000,
    },
    value: 10,
    valueCurrency: 'USD',
    inStock: true,
  },
  {
    id: 'xbox-10',
    name: 'Xbox $10 Gift Card',
    category: 'gaming',
    description: 'Games, apps, and content on Xbox',
    icon: '🎯',
    basePoints: 91000,
    regionalPricing: {
      'US': 91000,
      'CA': 100000,
      'GB': 85000,
      'AU': 120000,
      'IN': 750000,
    },
    value: 10,
    valueCurrency: 'USD',
    inStock: true,
  },
  {
    id: 'amazon-10',
    name: 'Amazon $10 Gift Card',
    category: 'shopping',
    description: 'Shop anything on Amazon',
    icon: '🛍️',
    basePoints: 91000,
    regionalPricing: {
      'US': 91000,
      'CA': 100000,
      'GB': 85000,
      'AU': 120000,
      'IN': 750000,
      'BR': 450000,
    },
    value: 10,
    valueCurrency: 'USD',
    inStock: true,
  },
  {
    id: 'minecraft-20',
    name: 'Minecraft $20 Gift Card',
    category: 'gaming',
    description: 'Minecoins for Minecraft',
    icon: '⛏️',
    basePoints: 182000,
    regionalPricing: {
      'US': 182000,
      'CA': 200000,
      'GB': 170000,
      'AU': 240000,
      'IN': 1500000,
    },
    value: 20,
    valueCurrency: 'USD',
    inStock: true,
  },
  {
    id: 'netflix-15',
    name: 'Netflix $15 Gift Card',
    category: 'entertainment',
    description: 'Stream movies and shows',
    icon: '🎬',
    basePoints: 136500,
    regionalPricing: {
      'US': 136500,
      'CA': 150000,
      'GB': 127500,
      'AU': 180000,
      'IN': 1125000,
    },
    value: 15,
    valueCurrency: 'USD',
    inStock: true,
  },
  {
    id: 'spotify-15',
    name: 'Spotify $15 Gift Card',
    category: 'entertainment',
    description: 'Music streaming subscription',
    icon: '🎵',
    basePoints: 136500,
    regionalPricing: {
      'US': 136500,
      'CA': 150000,
      'GB': 127500,
      'AU': 180000,
      'IN': 1125000,
    },
    value: 15,
    valueCurrency: 'USD',
    inStock: true,
  },
  {
    id: 'discord-25',
    name: 'Discord Nitro $25 Gift',
    category: 'entertainment',
    description: 'Premium Discord features',
    icon: '💬',
    basePoints: 227500,
    regionalPricing: {
      'US': 227500,
      'CA': 250000,
      'GB': 212500,
      'AU': 300000,
      'IN': 1875000,
    },
    value: 25,
    valueCurrency: 'USD',
    inStock: true,
  },
  {
    id: 'charity-donation',
    name: 'Donate to Charity',
    category: 'donation',
    description: 'Support your favorite cause',
    icon: '❤️',
    basePoints: 50000,
    regionalPricing: {
      'US': 50000,
      'CA': 55000,
      'GB': 47000,
      'AU': 70000,
      'IN': 400000,
    },
    value: 5,
    valueCurrency: 'USD',
    inStock: true,
  },
];

class RedemptionCatalog {
  private userLocation: UserLocation | null = null;
  private cachedItems: RedemptionItem[] = [];

  /**
   * Fetch user location based on IP
   */
  async getUserLocation(): Promise<UserLocation> {
    if (this.userLocation) {
      return this.userLocation;
    }

    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      this.userLocation = {
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region,
        city: data.city,
        ip: data.ip,
      };

      // Cache location for 24 hours
      await AsyncStorage.setItem('user_location', JSON.stringify(this.userLocation));
      return this.userLocation;
    } catch (error) {
      console.error('Error fetching user location:', error);
      // Return default US location
      return {
        country: 'United States',
        countryCode: 'US',
      };
    }
  }

  /**
   * Get all redemption items with pricing for user's region
   */
  async getRedemptionItems(): Promise<RedemptionItem[]> {
    try {
      const location = await this.getUserLocation();
      const countryCode = location.countryCode || 'US';

      // Adjust prices based on user's region
      const itemsWithRegionalPricing = REDEMPTION_ITEMS.map((item) => ({
        ...item,
        basePoints: item.regionalPricing[countryCode] || item.basePoints,
      }));

      this.cachedItems = itemsWithRegionalPricing;
      return itemsWithRegionalPricing;
    } catch (error) {
      console.error('Error getting redemption items:', error);
      return REDEMPTION_ITEMS;
    }
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(
    category: RedemptionItem['category']
  ): Promise<RedemptionItem[]> {
    const items = await this.getRedemptionItems();
    return items.filter((item) => item.category === category);
  }

  /**
   * Get items sorted by points (ascending)
   */
  async getItemsSortedByPoints(): Promise<RedemptionItem[]> {
    const items = await this.getRedemptionItems();
    return items.sort((a, b) => a.basePoints - b.basePoints);
  }

  /**
   * Get items sorted by value (descending)
   */
  async getItemsSortedByValue(): Promise<RedemptionItem[]> {
    const items = await this.getRedemptionItems();
    return items.sort((a, b) => b.value - a.value);
  }

  /**
   * Calculate points needed to reach a redemption item
   */
  calculatePointsNeeded(currentPoints: number, itemPoints: number): number {
    return Math.max(0, itemPoints - currentPoints);
  }

  /**
   * Calculate progress percentage to redemption
   */
  calculateProgress(currentPoints: number, itemPoints: number): number {
    return Math.min(100, (currentPoints / itemPoints) * 100);
  }

  /**
   * Estimate days to redemption based on earning rate
   */
  estimateDaysToRedemption(
    currentPoints: number,
    itemPoints: number,
    dailyEarnings: number
  ): number {
    if (dailyEarnings <= 0) return Infinity;
    const pointsNeeded = this.calculatePointsNeeded(currentPoints, itemPoints);
    return Math.ceil(pointsNeeded / dailyEarnings);
  }

  /**
   * Get best value items (highest value per point)
   */
  async getBestValueItems(): Promise<RedemptionItem[]> {
    const items = await this.getRedemptionItems();
    return items
      .map((item) => ({
        ...item,
        valuePerPoint: item.value / item.basePoints,
      }))
      .sort((a, b) => b.valuePerPoint - a.valuePerPoint)
      .slice(0, 5);
  }

  /**
   * Search items by name
   */
  async searchItems(query: string): Promise<RedemptionItem[]> {
    const items = await this.getRedemptionItems();
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get user location info
   */
  async getLocationInfo(): Promise<UserLocation> {
    return this.getUserLocation();
  }
}

export const redemptionCatalog = new RedemptionCatalog();
