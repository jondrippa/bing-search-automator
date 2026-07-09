/**
 * Analytics Service
 * Tracks and calculates earning metrics, trends, and efficiency data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyRecord {
  date: string;
  pointsEarned: number;
  searchesCompleted: number;
  activitiesCompleted: number;
  sessionDuration: number; // in minutes
}

export interface AnalyticsMetrics {
  totalPoints: number;
  totalSearches: number;
  totalActivities: number;
  averagePointsPerSearch: number;
  averagePointsPerDay: number;
  bestDay: DailyRecord | null;
  worstDay: DailyRecord | null;
  streakDays: number;
  lastUpdated: string;
}

export interface TrendData {
  date: string;
  points: number;
  searches: number;
  efficiency: number; // points per search
}

const ANALYTICS_KEY = 'analytics_daily_records';
const CACHE_KEY = 'analytics_cache';

class AnalyticsService {
  /**
   * Record daily activity
   */
  async recordDailyActivity(record: Omit<DailyRecord, 'date'>): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = await this.getDailyRecords();

      // Update or add today's record
      const existingIndex = records.findIndex((r) => r.date === today);
      if (existingIndex >= 0) {
        records[existingIndex] = {
          ...records[existingIndex],
          pointsEarned: record.pointsEarned,
          searchesCompleted: record.searchesCompleted,
          activitiesCompleted: record.activitiesCompleted,
          sessionDuration: record.sessionDuration,
        };
      } else {
        records.push({
          date: today,
          ...record,
        });
      }

      await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(records));
      await this.clearCache();
    } catch (error) {
      console.error('Error recording daily activity:', error);
    }
  }

  /**
   * Get all daily records
   */
  async getDailyRecords(): Promise<DailyRecord[]> {
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting daily records:', error);
      return [];
    }
  }

  /**
   * Get analytics metrics
   */
  async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      // Check cache first
      const cached = await this.getCache();
      if (cached) {
        return cached;
      }

      const records = await this.getDailyRecords();

      if (records.length === 0) {
        return {
          totalPoints: 0,
          totalSearches: 0,
          totalActivities: 0,
          averagePointsPerSearch: 0,
          averagePointsPerDay: 0,
          bestDay: null,
          worstDay: null,
          streakDays: 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      const totalPoints = records.reduce((sum, r) => sum + r.pointsEarned, 0);
      const totalSearches = records.reduce((sum, r) => sum + r.searchesCompleted, 0);
      const totalActivities = records.reduce((sum, r) => sum + r.activitiesCompleted, 0);

      const averagePointsPerSearch = totalSearches > 0 ? totalPoints / totalSearches : 0;
      const averagePointsPerDay = totalPoints / records.length;

      const bestDay = records.reduce((best, current) =>
        current.pointsEarned > best.pointsEarned ? current : best
      );

      const worstDay = records.reduce((worst, current) =>
        current.pointsEarned < worst.pointsEarned ? current : worst
      );

      const streakDays = this.calculateStreak(records);

      const metrics: AnalyticsMetrics = {
        totalPoints,
        totalSearches,
        totalActivities,
        averagePointsPerSearch,
        averagePointsPerDay,
        bestDay,
        worstDay,
        streakDays,
        lastUpdated: new Date().toISOString(),
      };

      await this.setCache(metrics);
      return metrics;
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        totalPoints: 0,
        totalSearches: 0,
        totalActivities: 0,
        averagePointsPerSearch: 0,
        averagePointsPerDay: 0,
        bestDay: null,
        worstDay: null,
        streakDays: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Get trend data for chart visualization
   */
  async getTrendData(days: number = 30): Promise<TrendData[]> {
    try {
      const records = await this.getDailyRecords();

      // Get last N days
      const recentRecords = records.slice(-days);

      return recentRecords.map((record) => ({
        date: record.date,
        points: record.pointsEarned,
        searches: record.searchesCompleted,
        efficiency:
          record.searchesCompleted > 0
            ? record.pointsEarned / record.searchesCompleted
            : 0,
      }));
    } catch (error) {
      console.error('Error getting trend data:', error);
      return [];
    }
  }

  /**
   * Get efficiency analysis
   */
  async getEfficiencyAnalysis(): Promise<{
    bestEfficiencyDay: TrendData | null;
    worstEfficiencyDay: TrendData | null;
    averageEfficiency: number;
    trend: 'improving' | 'declining' | 'stable';
  }> {
    try {
      const trendData = await this.getTrendData(30);

      if (trendData.length === 0) {
        return {
          bestEfficiencyDay: null,
          worstEfficiencyDay: null,
          averageEfficiency: 0,
          trend: 'stable',
        };
      }

      const bestEfficiencyDay = trendData.reduce((best, current) =>
        current.efficiency > best.efficiency ? current : best
      );

      const worstEfficiencyDay = trendData.reduce((worst, current) =>
        current.efficiency < worst.efficiency ? current : worst
      );

      const averageEfficiency =
        trendData.reduce((sum, d) => sum + d.efficiency, 0) / trendData.length;

      // Calculate trend
      const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
      const secondHalf = trendData.slice(Math.floor(trendData.length / 2));

      const firstHalfAvg =
        firstHalf.reduce((sum, d) => sum + d.efficiency, 0) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.reduce((sum, d) => sum + d.efficiency, 0) / secondHalf.length;

      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg * 1.05) {
        trend = 'improving';
      } else if (secondHalfAvg < firstHalfAvg * 0.95) {
        trend = 'declining';
      }

      return {
        bestEfficiencyDay,
        worstEfficiencyDay,
        averageEfficiency,
        trend,
      };
    } catch (error) {
      console.error('Error getting efficiency analysis:', error);
      return {
        bestEfficiencyDay: null,
        worstEfficiencyDay: null,
        averageEfficiency: 0,
        trend: 'stable',
      };
    }
  }

  /**
   * Calculate streak days
   */
  private calculateStreak(records: DailyRecord[]): number {
    if (records.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = records.length - 1; i >= 0; i--) {
      const recordDate = new Date(records[i].date);
      recordDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - (records.length - 1 - i));

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get cache
   */
  private async getCache(): Promise<AnalyticsMetrics | null> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEY);
      if (!stored) return null;

      const cached = JSON.parse(stored);
      const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();

      // Cache valid for 1 hour
      if (cacheAge < 3600000) {
        return cached;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set cache
   */
  private async setCache(metrics: AnalyticsMetrics): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Clear cache
   */
  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Reset all analytics data
   */
  async resetAnalytics(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ANALYTICS_KEY);
      await this.clearCache();
      console.log('Analytics data reset');
    } catch (error) {
      console.error('Error resetting analytics:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
