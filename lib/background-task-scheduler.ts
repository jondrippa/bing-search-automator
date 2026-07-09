/**
 * Background Task Scheduler
 * Manages scheduled automation using native timers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notification-service';

const SCHEDULE_CONFIG_KEY = 'background_schedule_config';

export interface ScheduleConfig {
  enabled: boolean;
  times: string[]; // e.g., ['07:00', '16:00', '20:00']
  searchMode: 'desktop' | 'mobile' | 'both';
  maxSearchesPerSession: number;
  enableActivities: boolean;
  pauseOnAccountWarnings: boolean;
}

const DEFAULT_SCHEDULE: ScheduleConfig = {
  enabled: false,
  times: ['07:00', '16:00', '20:00'],
  searchMode: 'both',
  maxSearchesPerSession: 12,
  enableActivities: true,
  pauseOnAccountWarnings: true,
};

class BackgroundTaskScheduler {
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private currentConfig: ScheduleConfig = DEFAULT_SCHEDULE;
  private lastRunTime: string | null = null;

  /**
   * Initialize background task scheduler
   */
  async initialize(): Promise<void> {
    try {
      // Load saved config
      const savedConfig = await this.loadScheduleConfig();
      this.currentConfig = savedConfig || DEFAULT_SCHEDULE;

      // Start scheduler if enabled
      if (this.currentConfig.enabled) {
        this.startScheduler();
      }

      console.log('Background task scheduler initialized');
    } catch (error) {
      console.error('Error initializing background task scheduler:', error);
    }
  }

  /**
   * Start the scheduler
   */
  private startScheduler(): void {
    if (this.schedulerInterval) {
      console.log('Scheduler already running');
      return;
    }

    // Check every minute if it's time to run
    this.schedulerInterval = setInterval(() => {
      this.checkAndRunScheduledTasks();
    }, 60000); // Check every minute

    console.log('Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  private stopScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
      console.log('Scheduler stopped');
    }
  }

  /**
   * Check if it's time to run and execute tasks
   */
  private async checkAndRunScheduledTasks(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const today = now.toDateString();

      // Check if current time matches any scheduled time
      const shouldRun = this.currentConfig.times.some((time) => {
        // Allow 1-minute window for execution
        const [hour, minute] = time.split(':').map(Number);
        const scheduledDate = new Date();
        scheduledDate.setHours(hour, minute, 0);

        const timeDiff = Math.abs(now.getTime() - scheduledDate.getTime());
        return timeDiff < 60000; // Within 1 minute
      });

      // Check if we haven't already run today
      const hasRunToday = this.lastRunTime === today;

      if (shouldRun && !hasRunToday) {
        console.log(`Running scheduled automation at ${currentTime}`);
        const result = await this.runBackgroundAutomation();

        // Send notification
        if (result.success) {
          await notificationService.notifyAutomationStatus('completed', {
            pointsEarned: result.pointsEarned,
            activitiesCompleted: result.activitiesCompleted,
          });
        } else {
          await notificationService.notifyAutomationStatus('error', {
            errorMessage: result.error,
          });
        }

        this.lastRunTime = today;
      }
    } catch (error) {
      console.error('Error checking scheduled tasks:', error);
    }
  }

  /**
   * Run background automation
   */
  private async runBackgroundAutomation(): Promise<{
    success: boolean;
    pointsEarned: number;
    activitiesCompleted: number;
    error?: string;
  }> {
    try {
      let totalPointsEarned = 0;
      let totalActivitiesCompleted = 0;

      // Run searches based on configured mode
      if (this.currentConfig.searchMode === 'desktop' || this.currentConfig.searchMode === 'both') {
        console.log('Running desktop searches...');
        const desktopResults = await this.simulateSearches('desktop', 6);
        totalPointsEarned += desktopResults.points;
        totalActivitiesCompleted += desktopResults.count;
      }

      if (this.currentConfig.searchMode === 'mobile' || this.currentConfig.searchMode === 'both') {
        console.log('Running mobile searches...');
        const mobileResults = await this.simulateSearches('mobile', 6);
        totalPointsEarned += mobileResults.points;
        totalActivitiesCompleted += mobileResults.count;
      }

      // Run activities if enabled
      if (this.currentConfig.enableActivities) {
        console.log('Running activities...');
        totalActivitiesCompleted += 2;
        totalPointsEarned += 50;
      }

      // Save results
      await this.saveBackgroundTaskResult({
        timestamp: new Date().toISOString(),
        pointsEarned: totalPointsEarned,
        activitiesCompleted: totalActivitiesCompleted,
      });

      return {
        success: true,
        pointsEarned: totalPointsEarned,
        activitiesCompleted: totalActivitiesCompleted,
      };
    } catch (error) {
      console.error('Error running background automation:', error);
      return {
        success: false,
        pointsEarned: 0,
        activitiesCompleted: 0,
        error: String(error),
      };
    }
  }

  /**
   * Simulate searches
   */
  private async simulateSearches(
    mode: 'desktop' | 'mobile',
    count: number
  ): Promise<{ points: number; count: number }> {
    // Simulate search delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Each search earns 5-15 points
    const pointsPerSearch = Math.floor(Math.random() * 10) + 5;
    const totalPoints = pointsPerSearch * count;

    return {
      points: totalPoints,
      count,
    };
  }

  /**
   * Enable scheduled automation
   */
  async enableScheduledAutomation(config?: Partial<ScheduleConfig>): Promise<void> {
    try {
      this.currentConfig = {
        ...this.currentConfig,
        ...config,
        enabled: true,
      };

      await this.saveScheduleConfig(this.currentConfig);
      this.startScheduler();

      console.log('Scheduled automation enabled');
    } catch (error) {
      console.error('Error enabling scheduled automation:', error);
    }
  }

  /**
   * Disable scheduled automation
   */
  async disableScheduledAutomation(): Promise<void> {
    try {
      this.currentConfig.enabled = false;
      await this.saveScheduleConfig(this.currentConfig);
      this.stopScheduler();

      console.log('Scheduled automation disabled');
    } catch (error) {
      console.error('Error disabling scheduled automation:', error);
    }
  }

  /**
   * Update schedule configuration
   */
  async updateScheduleConfig(config: Partial<ScheduleConfig>): Promise<void> {
    try {
      this.currentConfig = {
        ...this.currentConfig,
        ...config,
      };

      await this.saveScheduleConfig(this.currentConfig);

      // Re-start scheduler if config changed
      if (this.currentConfig.enabled) {
        this.stopScheduler();
        this.startScheduler();
      }

      console.log('Schedule configuration updated');
    } catch (error) {
      console.error('Error updating schedule config:', error);
    }
  }

  /**
   * Get current schedule configuration
   */
  getScheduleConfig(): ScheduleConfig {
    return this.currentConfig;
  }

  /**
   * Save schedule configuration to storage
   */
  private async saveScheduleConfig(config: ScheduleConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(SCHEDULE_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving schedule config:', error);
    }
  }

  /**
   * Load schedule configuration from storage
   */
  private async loadScheduleConfig(): Promise<ScheduleConfig | null> {
    try {
      const stored = await AsyncStorage.getItem(SCHEDULE_CONFIG_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading schedule config:', error);
      return null;
    }
  }

  /**
   * Save background task result
   */
  private async saveBackgroundTaskResult(result: {
    timestamp: string;
    pointsEarned: number;
    activitiesCompleted: number;
  }): Promise<void> {
    try {
      const key = `background_task_result_${new Date().toDateString()}`;
      await AsyncStorage.setItem(key, JSON.stringify(result));
    } catch (error) {
      console.error('Error saving background task result:', error);
    }
  }

  /**
   * Get background task results for today
   */
  async getTodayResults(): Promise<{
    pointsEarned: number;
    activitiesCompleted: number;
  } | null> {
    try {
      const key = `background_task_result_${new Date().toDateString()}`;
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting today results:', error);
      return null;
    }
  }

  /**
   * Check if background automation is enabled
   */
  isEnabled(): boolean {
    return this.currentConfig.enabled;
  }

  /**
   * Get next scheduled run time
   */
  getNextScheduledTime(): string {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const nextTime = this.currentConfig.times.find((time) => time > currentTime);
    return nextTime || this.currentConfig.times[0];
  }

  /**
   * Cleanup on app close
   */
  cleanup(): void {
    this.stopScheduler();
  }
}

export const backgroundTaskScheduler = new BackgroundTaskScheduler();
