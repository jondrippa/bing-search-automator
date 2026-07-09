/**
 * Achievements System
 * Tracks user achievements and badges
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'points' | 'searches' | 'streak' | 'activities' | 'special';
  requirement: number;
  unlockedAt?: string;
  progress: number;
}

export interface AchievementCategory {
  name: string;
  achievements: Achievement[];
  completedCount: number;
}

const ACHIEVEMENTS_KEY = 'user_achievements';

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Points milestones
  {
    id: 'first_100',
    name: 'First Steps',
    description: 'Earn your first 100 points',
    icon: '🎯',
    category: 'points',
    requirement: 100,
    progress: 0,
  },
  {
    id: 'first_1000',
    name: 'Thousand Points',
    description: 'Reach 1,000 total points',
    icon: '⭐',
    category: 'points',
    requirement: 1000,
    progress: 0,
  },
  {
    id: 'first_5000',
    name: 'Five Thousand Club',
    description: 'Reach 5,000 total points',
    icon: '🌟',
    category: 'points',
    requirement: 5000,
    progress: 0,
  },
  {
    id: 'first_10000',
    name: 'Ten Thousand Legend',
    description: 'Reach 10,000 total points',
    icon: '👑',
    category: 'points',
    requirement: 10000,
    progress: 0,
  },

  // Search milestones
  {
    id: 'first_10_searches',
    name: 'Search Starter',
    description: 'Complete 10 searches',
    icon: '🔍',
    category: 'searches',
    requirement: 10,
    progress: 0,
  },
  {
    id: 'first_100_searches',
    name: 'Search Master',
    description: 'Complete 100 searches',
    icon: '🔎',
    category: 'searches',
    requirement: 100,
    progress: 0,
  },
  {
    id: 'first_500_searches',
    name: 'Search Expert',
    description: 'Complete 500 searches',
    icon: '🕵️',
    category: 'searches',
    requirement: 500,
    progress: 0,
  },

  // Streak milestones
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: 3,
    progress: 0,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
    category: 'streak',
    requirement: 7,
    progress: 0,
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    category: 'streak',
    requirement: 30,
    progress: 0,
  },

  // Activity milestones
  {
    id: 'first_10_activities',
    name: 'Activity Enthusiast',
    description: 'Complete 10 activities',
    icon: '⚡',
    category: 'activities',
    requirement: 10,
    progress: 0,
  },
  {
    id: 'first_50_activities',
    name: 'Activity Champion',
    description: 'Complete 50 activities',
    icon: '🎪',
    category: 'activities',
    requirement: 50,
    progress: 0,
  },

  // Special achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Use the app on day 1',
    icon: '🚀',
    category: 'special',
    requirement: 1,
    progress: 0,
  },
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Earn 500+ points in a single day',
    icon: '💯',
    category: 'special',
    requirement: 500,
    progress: 0,
  },
];

class AchievementSystem {
  /**
   * Get all achievements with progress
   */
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const stored = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (!stored) {
        await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(ACHIEVEMENT_DEFINITIONS));
        return ACHIEVEMENT_DEFINITIONS;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting achievements:', error);
      return ACHIEVEMENT_DEFINITIONS;
    }
  }

  /**
   * Update achievement progress
   */
  async updateProgress(
    totalPoints: number,
    totalSearches: number,
    streakDays: number,
    totalActivities: number
  ): Promise<Achievement[] | undefined> {
    try {
      const achievements = await this.getAllAchievements();

      achievements.forEach((achievement) => {
        if (achievement.unlockedAt) return; // Already unlocked

        switch (achievement.category) {
          case 'points':
            achievement.progress = totalPoints;
            if (totalPoints >= achievement.requirement) {
              achievement.unlockedAt = new Date().toISOString();
            }
            break;
          case 'searches':
            achievement.progress = totalSearches;
            if (totalSearches >= achievement.requirement) {
              achievement.unlockedAt = new Date().toISOString();
            }
            break;
          case 'streak':
            achievement.progress = streakDays;
            if (streakDays >= achievement.requirement) {
              achievement.unlockedAt = new Date().toISOString();
            }
            break;
          case 'activities':
            achievement.progress = totalActivities;
            if (totalActivities >= achievement.requirement) {
              achievement.unlockedAt = new Date().toISOString();
            }
            break;
        }
      });

      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      return achievements;
    } catch (error) {
      console.error('Error updating progress:', error);
      return ACHIEVEMENT_DEFINITIONS;
    }
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(): Promise<AchievementCategory[]> {
    try {
      const achievements = await this.getAllAchievements();

      const categories: Record<string, AchievementCategory> = {
        points: { name: 'Points', achievements: [], completedCount: 0 },
        searches: { name: 'Searches', achievements: [], completedCount: 0 },
        streak: { name: 'Streaks', achievements: [], completedCount: 0 },
        activities: { name: 'Activities', achievements: [], completedCount: 0 },
        special: { name: 'Special', achievements: [], completedCount: 0 },
      };

      achievements.forEach((achievement) => {
        categories[achievement.category].achievements.push(achievement);
        if (achievement.unlockedAt) {
          categories[achievement.category].completedCount++;
        }
      });

      return Object.values(categories);
    } catch (error) {
      console.error('Error getting achievements by category:', error);
      return [];
    }
  }

  /**
   * Get unlocked achievements
   */
  async getUnlockedAchievements(): Promise<Achievement[]> {
    try {
      const achievements = await this.getAllAchievements();
      return achievements.filter((a) => a.unlockedAt);
    } catch (error) {
      console.error('Error getting unlocked achievements:', error);
      return [];
    }
  }

  /**
   * Get completion percentage
   */
  async getCompletionPercentage(): Promise<number> {
    try {
      const achievements = await this.getAllAchievements();
      const unlocked = achievements.filter((a) => a.unlockedAt).length;
      return Math.round((unlocked / achievements.length) * 100);
    } catch (error) {
      console.error('Error getting completion percentage:', error);
      return 0;
    }
  }

  /**
   * Reset achievements
   */
  async resetAchievements(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACHIEVEMENTS_KEY);
      console.log('Achievements reset');
    } catch (error) {
      console.error('Error resetting achievements:', error);
    }
  }
}

export const achievementSystem = new AchievementSystem();
