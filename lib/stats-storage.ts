import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyStats {
  date: string;
  searches: number;
  points: number;
}

export interface StatsData {
  dailyStats: DailyStats[];
  totalPoints: number;
  totalSearches: number;
  lastUpdated: string;
}

const STATS_KEY = 'bing_rewards_stats';

/**
 * Get statistics data from AsyncStorage
 */
export async function getStats(): Promise<StatsData | null> {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving stats:', error);
    return null;
  }
}

/**
 * Save statistics data to AsyncStorage
 */
export async function saveStats(stats: StatsData): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

/**
 * Record a search activity
 */
export async function recordSearch(points: number = 0): Promise<void> {
  try {
    const stats = await getStats();
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (!stats) {
      // Initialize new stats
      const newStats: StatsData = {
        dailyStats: [{ date: today, searches: 1, points }],
        totalPoints: points,
        totalSearches: 1,
        lastUpdated: new Date().toISOString(),
      };
      await saveStats(newStats);
      return;
    }

    // Update existing stats
    const lastDay = stats.dailyStats[stats.dailyStats.length - 1];
    
    if (lastDay.date === today) {
      // Update today's stats
      lastDay.searches += 1;
      lastDay.points += points;
    } else {
      // Add new day
      stats.dailyStats.push({ date: today, searches: 1, points });
      // Keep only last 30 days
      if (stats.dailyStats.length > 30) {
        stats.dailyStats = stats.dailyStats.slice(-30);
      }
    }

    stats.totalPoints += points;
    stats.totalSearches += 1;
    stats.lastUpdated = new Date().toISOString();

    await saveStats(stats);
  } catch (error) {
    console.error('Error recording search:', error);
  }
}

/**
 * Reset all statistics
 */
export async function resetStats(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STATS_KEY);
  } catch (error) {
    console.error('Error resetting stats:', error);
  }
}

/**
 * Get statistics for the last N days
 */
export async function getStatsForDays(days: number = 7): Promise<DailyStats[]> {
  try {
    const stats = await getStats();
    if (!stats) return [];
    
    return stats.dailyStats.slice(-days);
  } catch (error) {
    console.error('Error getting stats for days:', error);
    return [];
  }
}
