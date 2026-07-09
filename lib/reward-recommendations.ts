/**
 * Reward Recommendations Engine
 * Provides AI-powered suggestions based on earning patterns and user preferences
 */

import { redemptionCatalog, type RedemptionItem } from './redemption-catalog';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecommendationResult {
  item: RedemptionItem;
  reason: string;
  daysToRedemption: number;
  valuePerPoint: number;
  priority: 'high' | 'medium' | 'low';
}

export interface UserEarningProfile {
  dailyEarnings: number;
  totalPointsEarned: number;
  averageSessionLength: number;
  preferredCategories: string[];
  recentRedemptions: string[];
}

class RewardRecommendations {
  /**
   * Get personalized reward recommendations
   */
  async getRecommendations(
    currentPoints: number,
    userProfile: UserEarningProfile
  ): Promise<RecommendationResult[]> {
    try {
      const items = await redemptionCatalog.getRedemptionItems();

      const recommendations = items
        .map((item) => {
          const daysToRedemption = redemptionCatalog.estimateDaysToRedemption(
            currentPoints,
            item.basePoints,
            userProfile.dailyEarnings
          );

          const valuePerPoint = item.value / item.basePoints;
          const priority = this.calculatePriority(
            item,
            daysToRedemption,
            userProfile
          );

          const reason = this.generateReason(
            item,
            daysToRedemption,
            valuePerPoint,
            userProfile
          );

          return {
            item,
            reason,
            daysToRedemption,
            valuePerPoint,
            priority,
          };
        })
        .filter((rec) => rec.daysToRedemption < Infinity)
        .sort((a, b) => {
          // Sort by priority, then by days to redemption
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return a.daysToRedemption - b.daysToRedemption;
        });

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Get quick win recommendations (achievable within 3 days)
   */
  async getQuickWins(
    currentPoints: number,
    dailyEarnings: number
  ): Promise<RecommendationResult[]> {
    try {
      const items = await redemptionCatalog.getRedemptionItems();

      const quickWins = items
        .map((item) => {
          const daysToRedemption = redemptionCatalog.estimateDaysToRedemption(
            currentPoints,
            item.basePoints,
            dailyEarnings
          );

          return {
            item,
            reason: `Achievable in ${Math.ceil(daysToRedemption)} days`,
            daysToRedemption,
            valuePerPoint: item.value / item.basePoints,
            priority: 'high' as const,
          };
        })
        .filter((rec) => rec.daysToRedemption <= 3 && rec.daysToRedemption > 0)
        .sort((a, b) => a.daysToRedemption - b.daysToRedemption);

      return quickWins;
    } catch (error) {
      console.error('Error getting quick wins:', error);
      return [];
    }
  }

  /**
   * Get best value recommendations
   */
  async getBestValue(
    dailyEarnings: number
  ): Promise<RecommendationResult[]> {
    try {
      const items = await redemptionCatalog.getRedemptionItems();

      const bestValue = items
        .map((item) => ({
          item,
          reason: `Best value: $${item.value} per ${item.basePoints.toLocaleString()} points`,
          daysToRedemption: Infinity,
          valuePerPoint: item.value / item.basePoints,
          priority: 'high' as const,
        }))
        .sort((a, b) => b.valuePerPoint - a.valuePerPoint)
        .slice(0, 5);

      return bestValue;
    } catch (error) {
      console.error('Error getting best value:', error);
      return [];
    }
  }

  /**
   * Calculate recommendation priority
   */
  private calculatePriority(
    item: RedemptionItem,
    daysToRedemption: number,
    userProfile: UserEarningProfile
  ): 'high' | 'medium' | 'low' {
    // High priority: achievable within 2 days or matches preferred category
    if (daysToRedemption <= 2) return 'high';
    if (userProfile.preferredCategories.includes(item.category)) return 'high';

    // Medium priority: achievable within 7 days
    if (daysToRedemption <= 7) return 'medium';

    // Low priority: long-term goals
    return 'low';
  }

  /**
   * Generate recommendation reason
   */
  private generateReason(
    item: RedemptionItem,
    daysToRedemption: number,
    valuePerPoint: number,
    userProfile: UserEarningProfile
  ): string {
    if (daysToRedemption <= 1) {
      return `🔥 You can get this TODAY!`;
    }

    if (daysToRedemption <= 3) {
      return `⚡ Achievable in ${Math.ceil(daysToRedemption)} days`;
    }

    if (valuePerPoint > 0.00015) {
      return `💎 Excellent value at $${item.value}/${item.basePoints.toLocaleString()} pts`;
    }

    if (userProfile.preferredCategories.includes(item.category)) {
      return `❤️ Matches your favorite category`;
    }

    return `📅 Achievable in ~${Math.ceil(daysToRedemption)} days`;
  }

  /**
   * Get personalized earning goal
   */
  async getEarningGoal(
    currentPoints: number,
    dailyEarnings: number
  ): Promise<{
    targetPoints: number;
    targetItem: RedemptionItem;
    daysNeeded: number;
    motivation: string;
  } | null> {
    try {
      const recommendations = await this.getQuickWins(currentPoints, dailyEarnings);

      if (recommendations.length === 0) {
        return null;
      }

      const topRecommendation = recommendations[0];

      return {
        targetPoints: topRecommendation.item.basePoints,
        targetItem: topRecommendation.item,
        daysNeeded: Math.ceil(topRecommendation.daysToRedemption),
        motivation: `You're ${Math.round(
          (currentPoints / topRecommendation.item.basePoints) * 100
        )}% of the way to ${topRecommendation.item.name}!`,
      };
    } catch (error) {
      console.error('Error getting earning goal:', error);
      return null;
    }
  }

  /**
   * Save user earning profile
   */
  async saveEarningProfile(profile: UserEarningProfile): Promise<void> {
    try {
      await AsyncStorage.setItem('earning_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving earning profile:', error);
    }
  }

  /**
   * Load user earning profile
   */
  async loadEarningProfile(): Promise<UserEarningProfile | null> {
    try {
      const stored = await AsyncStorage.getItem('earning_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading earning profile:', error);
      return null;
    }
  }

  /**
   * Update earning profile based on activity
   */
  async updateEarningProfile(
    pointsEarned: number,
    sessionLength: number
  ): Promise<UserEarningProfile> {
    try {
      const existing = await this.loadEarningProfile();

      const updated: UserEarningProfile = {
        dailyEarnings: existing?.dailyEarnings || 300,
        totalPointsEarned: (existing?.totalPointsEarned || 0) + pointsEarned,
        averageSessionLength:
          existing && existing.averageSessionLength > 0
            ? (existing.averageSessionLength + sessionLength) / 2
            : sessionLength,
        preferredCategories: existing?.preferredCategories || ['gaming'],
        recentRedemptions: existing?.recentRedemptions || [],
      };

      await this.saveEarningProfile(updated);
      return updated;
    } catch (error) {
      console.error('Error updating earning profile:', error);
      return {
        dailyEarnings: 300,
        totalPointsEarned: 0,
        averageSessionLength: 0,
        preferredCategories: [],
        recentRedemptions: [],
      };
    }
  }
}

export const rewardRecommendations = new RewardRecommendations();
