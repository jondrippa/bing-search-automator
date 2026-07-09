/**
 * Live Opportunities Tracker
 * Fetches real-time earning opportunities from Bing Rewards API
 * Replaces mock data with actual activities
 */

import bingRewardsAPI, { type RewardsActivity } from './bing-rewards-api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Re-export RewardsActivity type for use in components
export type { RewardsActivity };

const CACHE_KEY = 'bing_rewards_opportunities_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface CachedOpportunities {
  opportunities: RewardsActivity[];
  lastFetched: number;
}

/**
 * Fetch opportunities from API with caching
 */
export async function fetchLiveOpportunities(): Promise<RewardsActivity[]> {
  try {
    // Check cache first
    const cached = await getCachedOpportunities();
    if (cached && Date.now() - cached.lastFetched < CACHE_DURATION) {
      console.log('Using cached opportunities');
      return cached.opportunities;
    }

    // Fetch from API
    console.log('Fetching opportunities from API...');
    const opportunities = await bingRewardsAPI.getAllActivities();

    // Cache the results
    await cacheOpportunities(opportunities);

    return opportunities;
  } catch (error) {
    console.error('Error fetching live opportunities:', error);
    // Fall back to cache if API fails
    const cached = await getCachedOpportunities();
    return cached?.opportunities || [];
  }
}

/**
 * Fetch specific category of opportunities
 */
export async function fetchOpportunitiesByCategory(
  category: RewardsActivity['category']
): Promise<RewardsActivity[]> {
  try {
    const opportunities = await fetchLiveOpportunities();
    return opportunities.filter((opp) => opp.category === category);
  } catch (error) {
    console.error(`Error fetching ${category} opportunities:`, error);
    return [];
  }
}

/**
 * Get high-priority opportunities (expiring soon or high points)
 */
export async function getHighPriorityOpportunities(): Promise<RewardsActivity[]> {
  try {
    const opportunities = await fetchLiveOpportunities();
    return opportunities
      .filter((opp) => opp.priority === 'high')
      .sort((a, b) => b.pointsAvailable - a.pointsAvailable);
  } catch (error) {
    console.error('Error fetching high-priority opportunities:', error);
    return [];
  }
}

/**
 * Get opportunities expiring within specified time
 */
export async function getExpiringOpportunities(
  minutesUntilExpiry: number = 120
): Promise<RewardsActivity[]> {
  try {
    const opportunities = await fetchLiveOpportunities();
    const now = Date.now();
    const expiryMs = minutesUntilExpiry * 60 * 1000;

    return opportunities.filter((opp) => {
      if (!opp.expiresAt) return false;
      const expiresAt = new Date(opp.expiresAt).getTime();
      return expiresAt > now && expiresAt - now <= expiryMs;
    });
  } catch (error) {
    console.error('Error fetching expiring opportunities:', error);
    return [];
  }
}

/**
 * Get total available points from all opportunities
 */
export async function getTotalAvailablePoints(): Promise<number> {
  try {
    const opportunities = await fetchLiveOpportunities();
    return opportunities.reduce((sum, opp) => sum + opp.pointsAvailable, 0);
  } catch (error) {
    console.error('Error calculating total points:', error);
    return 0;
  }
}

/**
 * Complete an opportunity and earn points
 */
export async function completeOpportunity(opportunityId: string): Promise<number> {
  try {
    const pointsEarned = await bingRewardsAPI.completeActivity(opportunityId);
    // Invalidate cache to fetch fresh data
    await invalidateCache();
    return pointsEarned;
  } catch (error) {
    console.error('Error completing opportunity:', error);
    throw error;
  }
}

/**
 * Get trending searches for bonus points
 */
export async function getTrendingSearches(): Promise<RewardsActivity[]> {
  try {
    return await bingRewardsAPI.getTrendingSearches();
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    return [];
  }
}

/**
 * Get daily set activities
 */
export async function getDailySetActivities(): Promise<RewardsActivity[]> {
  try {
    const dailySet = await bingRewardsAPI.getDailySet();
    return dailySet.activities;
  } catch (error) {
    console.error('Error fetching daily set:', error);
    return [];
  }
}

/**
 * Cache opportunities to AsyncStorage
 */
async function cacheOpportunities(opportunities: RewardsActivity[]): Promise<void> {
  try {
    const data: CachedOpportunities = {
      opportunities,
      lastFetched: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching opportunities:', error);
  }
}

/**
 * Get cached opportunities
 */
async function getCachedOpportunities(): Promise<CachedOpportunities | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving cached opportunities:', error);
    return null;
  }
}

/**
 * Invalidate cache
 */
export async function invalidateCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Refresh opportunities from API
 */
export async function refreshOpportunities(): Promise<RewardsActivity[]> {
  try {
    await invalidateCache();
    return await fetchLiveOpportunities();
  } catch (error) {
    console.error('Error refreshing opportunities:', error);
    return [];
  }
}
