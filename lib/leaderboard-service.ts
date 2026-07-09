/**
 * Leaderboard Service
 * Manages user rankings and leaderboard data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  totalSearches: number;
  streakDays: number;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentUserRank: number;
  totalUsers: number;
  lastUpdated: string;
}

const LEADERBOARD_KEY = 'leaderboard_data';
const USER_ID_KEY = 'user_id';

class LeaderboardService {
  /**
   * Initialize user ID if not exists
   */
  async initializeUserId(): Promise<string> {
    try {
      let userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(USER_ID_KEY, userId);
      }
      return userId;
    } catch (error) {
      console.error('Error initializing user ID:', error);
      return `user_${Date.now()}`;
    }
  }

  /**
   * Get current user ID
   */
  async getUserId(): Promise<string> {
    try {
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      return userId || this.initializeUserId();
    } catch (error) {
      console.error('Error getting user ID:', error);
      return '';
    }
  }

  /**
   * Update user stats on leaderboard
   */
  async updateUserStats(
    totalPoints: number,
    totalSearches: number,
    streakDays: number
  ): Promise<void> {
    try {
      const userId = await this.getUserId();
      const leaderboard = await this.getLeaderboard();

      // Find or create user entry
      let userEntry = leaderboard.entries.find((e) => e.userId === userId);
      if (!userEntry) {
        userEntry = {
          rank: 0,
          userId,
          username: `User ${userId.substr(-6)}`,
          totalPoints: 0,
          totalSearches: 0,
          streakDays: 0,
          isCurrentUser: true,
        };
        leaderboard.entries.push(userEntry);
      }

      // Update stats
      userEntry.totalPoints = totalPoints;
      userEntry.totalSearches = totalSearches;
      userEntry.streakDays = streakDays;

      // Sort by points (descending), then by searches, then by streak
      leaderboard.entries.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (b.totalSearches !== a.totalSearches) {
          return b.totalSearches - a.totalSearches;
        }
        return b.streakDays - a.streakDays;
      });

      // Update ranks
      leaderboard.entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      leaderboard.currentUserRank = userEntry.rank;
      leaderboard.totalUsers = leaderboard.entries.length;
      leaderboard.lastUpdated = new Date().toISOString();

      await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(): Promise<LeaderboardData> {
    try {
      const stored = await AsyncStorage.getItem(LEADERBOARD_KEY);
      if (!stored) {
        return {
          entries: [],
          currentUserRank: 0,
          totalUsers: 0,
          lastUpdated: new Date().toISOString(),
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return {
        entries: [],
        currentUserRank: 0,
        totalUsers: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Get top N users
   */
  async getTopUsers(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const leaderboard = await this.getLeaderboard();
      return leaderboard.entries.slice(0, limit);
    } catch (error) {
      console.error('Error getting top users:', error);
      return [];
    }
  }

  /**
   * Get user rank and nearby users
   */
  async getUserRankWithContext(
    contextSize: number = 5
  ): Promise<LeaderboardEntry[]> {
    try {
      const leaderboard = await this.getLeaderboard();
      const userRank = leaderboard.currentUserRank;

      const startIndex = Math.max(0, userRank - contextSize - 1);
      const endIndex = Math.min(
        leaderboard.entries.length,
        userRank + contextSize
      );

      return leaderboard.entries.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error getting user rank context:', error);
      return [];
    }
  }

  /**
   * Get user position percentile
   */
  async getUserPercentile(): Promise<number> {
    try {
      const leaderboard = await this.getLeaderboard();
      if (leaderboard.totalUsers === 0) return 0;

      const percentile =
        ((leaderboard.totalUsers - leaderboard.currentUserRank) /
          leaderboard.totalUsers) *
        100;
      return Math.round(percentile);
    } catch (error) {
      console.error('Error getting user percentile:', error);
      return 0;
    }
  }

  /**
   * Reset leaderboard
   */
  async resetLeaderboard(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LEADERBOARD_KEY);
      console.log('Leaderboard reset');
    } catch (error) {
      console.error('Error resetting leaderboard:', error);
    }
  }
}

export const leaderboardService = new LeaderboardService();
