/**
 * Bing Rewards API Client
 * Fetches real-time activities, quizzes, surveys, and earning opportunities
 * from the Microsoft Rewards dashboard
 */

import axios, { AxiosInstance } from 'axios';

export interface RewardsActivity {
  id: string;
  title: string;
  description: string;
  category: 'quiz' | 'survey' | 'shopping' | 'xbox' | 'daily-task' | 'bonus' | 'trending';
  pointsAvailable: number;
  pointsEarned?: number;
  timeToComplete: number;
  isCompleted: boolean;
  expiresAt?: string;
  url?: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export interface UserProfile {
  id: string;
  email: string;
  points: number;
  tier: string;
  nextTierPoints?: number;
}

export interface DailySet {
  id: string;
  title: string;
  activities: RewardsActivity[];
  completedCount: number;
  totalCount: number;
  pointsAvailable: number;
}

class BingRewardsAPI {
  private client: AxiosInstance;
  private baseURL = 'https://rewards.bing.com/api';
  private authToken?: string;
  private userEmail?: string;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        throw error;
      }
    );
  }

  /**
   * Set authentication token (obtained from login)
   */
  setAuthToken(token: string, email: string) {
    this.authToken = token;
    this.userEmail = email;
  }

  /**
   * Fetch user profile and current points
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.client.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Fetch daily set activities
   */
  async getDailySet(): Promise<DailySet> {
    try {
      const response = await this.client.get('/dailyset');
      return this.parseActivities(response.data, 'daily-task');
    } catch (error) {
      console.error('Failed to fetch daily set:', error);
      throw error;
    }
  }

  /**
   * Fetch available quizzes
   */
  async getQuizzes(): Promise<RewardsActivity[]> {
    try {
      const response = await this.client.get('/activities/quizzes');
      return this.parseActivities(response.data, 'quiz');
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      return [];
    }
  }

  /**
   * Fetch available surveys
   */
  async getSurveys(): Promise<RewardsActivity[]> {
    try {
      const response = await this.client.get('/activities/surveys');
      return this.parseActivities(response.data, 'survey');
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      return [];
    }
  }

  /**
   * Fetch shopping opportunities
   */
  async getShoppingOpportunities(): Promise<RewardsActivity[]> {
    try {
      const response = await this.client.get('/activities/shopping');
      return this.parseActivities(response.data, 'shopping');
    } catch (error) {
      console.error('Failed to fetch shopping opportunities:', error);
      return [];
    }
  }

  /**
   * Fetch Xbox activities
   */
  async getXboxActivities(): Promise<RewardsActivity[]> {
    try {
      const response = await this.client.get('/activities/xbox');
      return this.parseActivities(response.data, 'xbox');
    } catch (error) {
      console.error('Failed to fetch Xbox activities:', error);
      return [];
    }
  }

  /**
   * Fetch all available activities and opportunities
   */
  async getAllActivities(): Promise<RewardsActivity[]> {
    try {
      const [dailySet, quizzes, surveys, shopping, xbox] = await Promise.all([
        this.getDailySet().then((set) => set.activities),
        this.getQuizzes(),
        this.getSurveys(),
        this.getShoppingOpportunities(),
        this.getXboxActivities(),
      ]);

      return [...dailySet, ...quizzes, ...surveys, ...shopping, ...xbox].filter(
        (activity) => !activity.isCompleted
      );
    } catch (error) {
      console.error('Failed to fetch all activities:', error);
      return [];
    }
  }

  /**
   * Get trending searches for bonus points
   */
  async getTrendingSearches(): Promise<RewardsActivity[]> {
    try {
      const response = await this.client.get('/trending');
      return response.data.map((trend: any) => ({
        id: trend.id,
        title: `Trending: ${trend.title}`,
        description: `Search for "${trend.keyword}" to earn bonus points`,
        category: 'trending' as const,
        pointsAvailable: trend.points || 75,
        timeToComplete: 5,
        isCompleted: false,
        icon: '🔥',
        priority: 'medium' as const,
      }));
    } catch (error) {
      console.error('Failed to fetch trending searches:', error);
      return [];
    }
  }

  /**
   * Complete an activity and claim points
   */
  async completeActivity(activityId: string): Promise<number> {
    try {
      const response = await this.client.post(`/activities/${activityId}/complete`);
      return response.data.pointsEarned || 0;
    } catch (error) {
      console.error('Failed to complete activity:', error);
      throw error;
    }
  }

  /**
   * Get activity details
   */
  async getActivityDetails(activityId: string): Promise<RewardsActivity> {
    try {
      const response = await this.client.get(`/activities/${activityId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch activity details:', error);
      throw error;
    }
  }

  /**
   * Parse API response and convert to RewardsActivity format
   */
  private parseActivities(data: any, category: RewardsActivity['category']): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.mapActivityData(item, category));
    }
    return this.mapActivityData(data, category);
  }

  /**
   * Map API response to RewardsActivity interface
   */
  private mapActivityData(item: any, category: RewardsActivity['category']): RewardsActivity {
    const categoryIcons: Record<RewardsActivity['category'], string> = {
      quiz: '🧠',
      survey: '📋',
      shopping: '🛍️',
      xbox: '🎮',
      'daily-task': '✨',
      bonus: '🎁',
      trending: '🔥',
    };

    return {
      id: item.id || item.activityId,
      title: item.title || item.name,
      description: item.description || item.subtitle || '',
      category,
      pointsAvailable: item.pointPotential || item.points || 0,
      pointsEarned: item.pointsEarned || 0,
      timeToComplete: item.estimatedTime || 5,
      isCompleted: item.isCompleted || item.completed || false,
      expiresAt: item.expirationDate || item.expiresAt,
      url: item.url || item.activityUrl,
      icon: categoryIcons[category],
      priority: this.determinePriority(item),
    };
  }

  /**
   * Determine priority based on points and expiration
   */
  private determinePriority(item: any): 'high' | 'medium' | 'low' {
    const points = item.pointPotential || item.points || 0;
    const expiresAt = item.expirationDate || item.expiresAt;

    // High priority: high points or expiring soon
    if (points >= 150 || (expiresAt && this.isExpiringSoon(expiresAt))) {
      return 'high';
    }

    // Medium priority: moderate points
    if (points >= 75) {
      return 'medium';
    }

    // Low priority: low points
    return 'low';
  }

  /**
   * Check if activity is expiring within 2 hours
   */
  private isExpiringSoon(expiresAt: string): boolean {
    const now = Date.now();
    const expiresAtTime = new Date(expiresAt).getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;

    return expiresAtTime - now <= twoHoursMs && expiresAtTime > now;
  }

  /**
   * Get account health status
   */
  async getAccountHealth(): Promise<{
    status: 'healthy' | 'warning' | 'at-risk';
    message: string;
    recommendations: string[];
  }> {
    try {
      const response = await this.client.get('/account/health');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch account health:', error);
      return {
        status: 'healthy',
        message: 'Account status unknown',
        recommendations: [],
      };
    }
  }
}

// Export singleton instance
export const bingRewardsAPI = new BingRewardsAPI();

export default bingRewardsAPI;
