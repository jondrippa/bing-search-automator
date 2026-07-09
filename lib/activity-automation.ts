/**
 * Activity Automation Engine
 * Automatically completes quizzes, surveys, daily sets, and other simple activities
 * Integrates with search automation for comprehensive earning
 */

import bingRewardsAPI, { type RewardsActivity } from './bing-rewards-api';
import { recordSearch } from './stats-storage';

export interface AutomationConfig {
  autoCompleteQuizzes: boolean;
  autoCompleteSurveys: boolean;
  autoCompleteDailySet: boolean;
  autoCompleteXboxActivities: boolean;
  delayBetweenActivities: number; // milliseconds
  maxConcurrentActivities: number;
  stopOnError: boolean;
}

export interface AutomationResult {
  success: boolean;
  totalPointsEarned: number;
  activitiesCompleted: number;
  activitiesFailed: number;
  errors: string[];
  duration: number; // milliseconds
}

export interface ActivityLog {
  timestamp: string;
  activityId: string;
  activityTitle: string;
  pointsEarned: number;
  status: 'success' | 'failed' | 'skipped';
  message: string;
}

class ActivityAutomationEngine {
  private config: AutomationConfig;
  private isRunning = false;
  private logs: ActivityLog[] = [];
  private totalPointsEarned = 0;

  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      autoCompleteQuizzes: true,
      autoCompleteSurveys: true,
      autoCompleteDailySet: true,
      autoCompleteXboxActivities: false,
      delayBetweenActivities: 2000,
      maxConcurrentActivities: 1,
      stopOnError: false,
      ...config,
    };
  }

  /**
   * Start automated activity completion
   */
  async startAutomation(): Promise<AutomationResult> {
    if (this.isRunning) {
      throw new Error('Automation already running');
    }

    this.isRunning = true;
    this.logs = [];
    this.totalPointsEarned = 0;
    const startTime = Date.now();
    let activitiesCompleted = 0;
    let activitiesFailed = 0;
    const errors: string[] = [];

    try {
      // Fetch all available activities
      this.log('Fetching available activities...', '', 0, 'success');
      const activities = await bingRewardsAPI.getAllActivities();

      if (activities.length === 0) {
        this.log('No activities available', '', 0, 'skipped');
        return this.buildResult(activitiesCompleted, activitiesFailed, errors, startTime);
      }

      // Filter activities based on config
      const activitiesToComplete = this.filterActivities(activities);

      if (activitiesToComplete.length === 0) {
        this.log('No activities match automation config', '', 0, 'skipped');
        return this.buildResult(activitiesCompleted, activitiesFailed, errors, startTime);
      }

      // Complete activities sequentially
      for (const activity of activitiesToComplete) {
        if (!this.isRunning) break;

        try {
          // Simulate activity completion (in production, this would interact with Bing Rewards)
          const pointsEarned = await this.completeActivity(activity);
          activitiesCompleted++;
          this.totalPointsEarned += pointsEarned;
          this.log(activity.title, activity.id, pointsEarned, 'success');

          // Record search for statistics
          await recordSearch(pointsEarned);

          // Delay between activities
          if (activitiesToComplete.indexOf(activity) < activitiesToComplete.length - 1) {
            await this.delay(this.config.delayBetweenActivities);
          }
        } catch (error) {
          activitiesFailed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`${activity.title}: ${errorMsg}`);
          this.log(activity.title, activity.id, 0, 'failed', errorMsg);

          if (this.config.stopOnError) {
            break;
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      this.log('Automation', '', 0, 'failed', errorMsg);
    } finally {
      this.isRunning = false;
    }

    return this.buildResult(activitiesCompleted, activitiesFailed, errors, startTime);
  }

  /**
   * Stop automation
   */
  stopAutomation(): void {
    this.isRunning = false;
    this.log('Automation stopped', '', 0, 'skipped');
  }

  /**
   * Filter activities based on automation config
   */
  private filterActivities(activities: RewardsActivity[]): RewardsActivity[] {
    return activities.filter((activity) => {
      if (activity.isCompleted) return false;

      switch (activity.category) {
        case 'quiz':
          return this.config.autoCompleteQuizzes;
        case 'survey':
          return this.config.autoCompleteSurveys;
        case 'daily-task':
          return this.config.autoCompleteDailySet;
        case 'xbox':
          return this.config.autoCompleteXboxActivities;
        default:
          return false;
      }
    });
  }

  /**
   * Complete a single activity
   */
  private async completeActivity(activity: RewardsActivity): Promise<number> {
    try {
      // Simulate activity completion with realistic delays
      const completionTime = activity.timeToComplete * 1000; // Convert to milliseconds
      const randomVariation = Math.random() * 0.3 * completionTime; // ±15% variation
      const totalTime = completionTime + randomVariation;

      await this.delay(totalTime);

      // Call API to complete activity
      const pointsEarned = await bingRewardsAPI.completeActivity(activity.id);

      return pointsEarned;
    } catch (error) {
      throw new Error(`Failed to complete ${activity.category}: ${error}`);
    }
  }

  /**
   * Auto-complete daily set activities
   */
  async completeDailySet(): Promise<AutomationResult> {
    if (this.isRunning) {
      throw new Error('Automation already running');
    }

    this.isRunning = true;
    this.logs = [];
    this.totalPointsEarned = 0;
    const startTime = Date.now();
    let activitiesCompleted = 0;
    let activitiesFailed = 0;
    const errors: string[] = [];

    try {
      this.log('Fetching daily set...', '', 0, 'success');
      const dailySet = await bingRewardsAPI.getDailySet();

      for (const activity of dailySet.activities) {
        if (!this.isRunning || activity.isCompleted) continue;

        try {
          const pointsEarned = await this.completeActivity(activity);
          activitiesCompleted++;
          this.totalPointsEarned += pointsEarned;
          this.log(activity.title, activity.id, pointsEarned, 'success');
          await recordSearch(pointsEarned);

          await this.delay(this.config.delayBetweenActivities);
        } catch (error) {
          activitiesFailed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(errorMsg);
          this.log(activity.title, activity.id, 0, 'failed', errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
    } finally {
      this.isRunning = false;
    }

    return this.buildResult(activitiesCompleted, activitiesFailed, errors, startTime);
  }

  /**
   * Auto-complete quizzes only
   */
  async completeQuizzes(): Promise<AutomationResult> {
    const tempConfig = this.config;
    this.config = {
      ...this.config,
      autoCompleteQuizzes: true,
      autoCompleteSurveys: false,
      autoCompleteDailySet: false,
      autoCompleteXboxActivities: false,
    };

    try {
      return await this.startAutomation();
    } finally {
      this.config = tempConfig;
    }
  }

  /**
   * Auto-complete surveys only
   */
  async completeSurveys(): Promise<AutomationResult> {
    const tempConfig = this.config;
    this.config = {
      ...this.config,
      autoCompleteQuizzes: false,
      autoCompleteSurveys: true,
      autoCompleteDailySet: false,
      autoCompleteXboxActivities: false,
    };

    try {
      return await this.startAutomation();
    } finally {
      this.config = tempConfig;
    }
  }

  /**
   * Get automation logs
   */
  getLogs(): ActivityLog[] {
    return this.logs;
  }

  /**
   * Get total points earned
   */
  getTotalPointsEarned(): number {
    return this.totalPointsEarned;
  }

  /**
   * Check if automation is running
   */
  isAutomationRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Private helper: Log activity
   */
  private log(
    title: string,
    activityId: string,
    points: number,
    status: 'success' | 'failed' | 'skipped',
    message: string = ''
  ): void {
    this.logs.push({
      timestamp: new Date().toLocaleTimeString(),
      activityId,
      activityTitle: title,
      pointsEarned: points,
      status,
      message,
    });
  }

  /**
   * Private helper: Delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Private helper: Build result
   */
  private buildResult(
    completed: number,
    failed: number,
    errors: string[],
    startTime: number
  ): AutomationResult {
    return {
      success: failed === 0,
      totalPointsEarned: this.totalPointsEarned,
      activitiesCompleted: completed,
      activitiesFailed: failed,
      errors,
      duration: Date.now() - startTime,
    };
  }
}

// Export singleton instance
export const automationEngine = new ActivityAutomationEngine();

export default automationEngine;
