/**
 * Bing Rewards API Client
 * Fetches real points, searches, and opportunities data from Bing Rewards
 */

interface BingRewardsUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  currentPoints: number;
}

interface BingRewardsMetrics {
  totalPoints: number;
  currentPoints: number;
  todayPoints: number;
  todaySearches: number;
  dailyQuota: number;
  dailySearchesCompleted: number;
  accountStatus: "active" | "inactive" | "suspended";
  lastUpdated: string;
}

interface BingRewardsOpportunity {
  id: string;
  title: string;
  description: string;
  pointsValue: number;
  category: "quiz" | "survey" | "shopping" | "xbox" | "search" | "other";
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number; // in minutes
  expiresAt: string;
  url?: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface BingRewardsDailyStats {
  date: string;
  points: number;
  searches: number;
  quizzes: number;
  surveys: number;
  shopping: number;
  xbox: number;
}

export class BingRewardsClient {
  private baseUrl = "https://rewards.microsoft.com/api";
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<BingRewardsUser> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  /**
   * Get current metrics (points, searches, quota)
   */
  async getMetrics(): Promise<BingRewardsMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/user/metrics`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        totalPoints: data.totalPoints || 0,
        currentPoints: data.currentPoints || 0,
        todayPoints: data.todayPoints || 0,
        todaySearches: data.todaySearches || 0,
        dailyQuota: data.dailyQuota || 150,
        dailySearchesCompleted: data.dailySearchesCompleted || 0,
        accountStatus: data.accountStatus || "active",
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching metrics:", error);
      throw error;
    }
  }

  /**
   * Get available opportunities
   */
  async getOpportunities(): Promise<BingRewardsOpportunity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/opportunities`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.opportunities || []).map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        pointsValue: opp.pointsValue || 0,
        category: opp.category || "other",
        difficulty: opp.difficulty || "easy",
        estimatedTime: opp.estimatedTime || 5,
        expiresAt: opp.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        url: opp.url,
        isCompleted: opp.isCompleted || false,
        completedAt: opp.completedAt,
      }));
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      throw error;
    }
  }

  /**
   * Get daily statistics for a date range
   */
  async getDailyStats(startDate: string, endDate: string): Promise<BingRewardsDailyStats[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/stats?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch daily stats: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.stats || []).map((stat: any) => ({
        date: stat.date,
        points: stat.points || 0,
        searches: stat.searches || 0,
        quizzes: stat.quizzes || 0,
        surveys: stat.surveys || 0,
        shopping: stat.shopping || 0,
        xbox: stat.xbox || 0,
      }));
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      throw error;
    }
  }

  /**
   * Complete an opportunity
   */
  async completeOpportunity(opportunityId: string): Promise<{ success: boolean; pointsEarned: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/opportunities/${opportunityId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to complete opportunity: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: data.success || true,
        pointsEarned: data.pointsEarned || 0,
      };
    } catch (error) {
      console.error("Error completing opportunity:", error);
      throw error;
    }
  }

  /**
   * Get account health status
   */
  async getAccountHealth(): Promise<{
    status: "healthy" | "warning" | "critical";
    accountAge: number;
    searchActivity: number;
    recentActivity: string;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/account-health`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch account health: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching account health:", error);
      throw error;
    }
  }

  /**
   * Get trending opportunities (high-value, limited-time)
   */
  async getTrendingOpportunities(): Promise<BingRewardsOpportunity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/user/opportunities/trending`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trending opportunities: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.opportunities || []).map((opp: any) => ({
        id: opp.id,
        title: opp.title,
        description: opp.description,
        pointsValue: opp.pointsValue || 0,
        category: opp.category || "other",
        difficulty: opp.difficulty || "easy",
        estimatedTime: opp.estimatedTime || 5,
        expiresAt: opp.expiresAt,
        url: opp.url,
        isCompleted: opp.isCompleted || false,
      }));
    } catch (error) {
      console.error("Error fetching trending opportunities:", error);
      throw error;
    }
  }
}

/**
 * Create a Bing Rewards client instance
 */
export function createBingRewardsClient(accessToken: string): BingRewardsClient {
  return new BingRewardsClient(accessToken);
}
