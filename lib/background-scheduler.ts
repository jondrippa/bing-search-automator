/**
 * Background Task Scheduler
 * Manages scheduled automation tasks using native timers
 * Runs daily searches and activities at configured times
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';

export interface ScheduledTask {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
  mode: 'desktop' | 'mobile' | 'both';
  lastRun?: string;
}

export interface ScheduleConfig {
  enabled: boolean;
  tasks: ScheduledTask[];
  autoResume: boolean;
  minDelayBetweenTasks: number; // minutes
}

const SCHEDULE_CONFIG_KEY = 'background_schedule_config';
const TASK_HISTORY_KEY = 'background_task_history';
const DEFAULT_TASKS: ScheduledTask[] = [
  { id: 'morning', time: '07:00', enabled: true, mode: 'both' },
  { id: 'afternoon', time: '16:00', enabled: true, mode: 'both' },
  { id: 'evening', time: '20:00', enabled: true, mode: 'both' },
];

class BackgroundScheduler {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private config: ScheduleConfig | null = null;
  private appState: AppStateStatus = 'active';
  private listeners: ((task: ScheduledTask) => void)[] = [];

  /**
   * Initialize the background scheduler
   */
  async initialize(): Promise<void> {
    try {
      // Load configuration
      const stored = await AsyncStorage.getItem(SCHEDULE_CONFIG_KEY);
      this.config = stored
        ? JSON.parse(stored)
        : {
            enabled: true,
            tasks: DEFAULT_TASKS,
            autoResume: true,
            minDelayBetweenTasks: 5,
          };

      // Listen to app state changes
      const subscription = AppState.addEventListener('change', this.handleAppStateChange);

      // Schedule all tasks
      if (this.config && this.config.enabled) {
        this.scheduleAllTasks();
      }

      console.log('Background scheduler initialized');
    } catch (error) {
      console.error('Error initializing background scheduler:', error);
    }
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    this.appState = nextAppState;

    if (nextAppState === 'active' && this.config?.autoResume) {
      // App came to foreground, reschedule tasks
      this.rescheduleAllTasks();
    }
  };

  /**
   * Schedule all enabled tasks
   */
  private scheduleAllTasks(): void {
    if (!this.config) return;

    this.config.tasks.forEach((task) => {
      if (task.enabled) {
        this.scheduleTask(task);
      }
    });
  }

  /**
   * Reschedule all tasks (called when app returns to foreground)
   */
  private rescheduleAllTasks(): void {
    // Clear existing timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    // Reschedule all tasks
    this.scheduleAllTasks();
  }

  /**
   * Schedule a single task
   */
  private scheduleTask(task: ScheduledTask): void {
    const [hours, minutes] = task.time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If scheduled time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delayMs = scheduledTime.getTime() - now.getTime();

    // Schedule the task
    const timer = setTimeout(() => {
      this.executeTask(task);
      // Reschedule for next day
      this.scheduleTask(task);
    }, delayMs);

    this.timers.set(task.id, timer);

    console.log(
      `Task "${task.id}" scheduled for ${scheduledTime.toLocaleTimeString()}`
    );
  }

  /**
   * Execute a scheduled task
   */
  private async executeTask(task: ScheduledTask): Promise<void> {
    try {
      console.log(`Executing scheduled task: ${task.id}`);

      // Record task execution
      await this.recordTaskExecution(task);

      // Emit event to listeners
      this.listeners.forEach((listener) => listener(task));

      // Update last run time
      const updated = { ...task, lastRun: new Date().toISOString() };
      await this.updateTask(task.id, updated);

      console.log(`Task "${task.id}" completed successfully`);
    } catch (error) {
      console.error(`Error executing task "${task.id}":`, error);
    }
  }

  /**
   * Record task execution in history
   */
  private async recordTaskExecution(task: ScheduledTask): Promise<void> {
    try {
      const history = await this.getTaskHistory();
      history.push({
        taskId: task.id,
        timestamp: new Date().toISOString(),
        mode: task.mode,
        status: 'completed',
      });

      // Keep only last 100 entries
      const trimmed = history.slice(-100);
      await AsyncStorage.setItem(TASK_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error recording task execution:', error);
    }
  }

  /**
   * Get task execution history
   */
  async getTaskHistory(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem(TASK_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting task history:', error);
      return [];
    }
  }

  /**
   * Get current configuration
   */
  async getConfig(): Promise<ScheduleConfig> {
    if (this.config === null) {
      const stored = await AsyncStorage.getItem(SCHEDULE_CONFIG_KEY);
      this.config = stored
        ? JSON.parse(stored)
        : {
            enabled: true,
            tasks: DEFAULT_TASKS,
            autoResume: true,
            minDelayBetweenTasks: 5,
          };
    }
    return this.config || {
      enabled: true,
      tasks: DEFAULT_TASKS,
      autoResume: true,
      minDelayBetweenTasks: 5,
    };
  }

  /**
   * Update configuration
   */
  async updateConfig(config: Partial<ScheduleConfig>): Promise<void> {
    try {
      const current = await this.getConfig();
      this.config = { ...current, ...config };
      await AsyncStorage.setItem(SCHEDULE_CONFIG_KEY, JSON.stringify(this.config));

      // Reschedule if enabled status changed
      if (config.enabled !== undefined) {
        if (config.enabled) {
          this.scheduleAllTasks();
        } else {
          this.timers.forEach((timer) => clearTimeout(timer));
          this.timers.clear();
        }
      }
    } catch (error) {
      console.error('Error updating schedule config:', error);
    }
  }

  /**
   * Get a specific task
   */
  async getTask(taskId: string): Promise<ScheduledTask | null> {
    try {
      const config = await this.getConfig();
      return config.tasks.find((t) => t.id === taskId) || null;
    } catch (error) {
      console.error('Error getting task:', error);
      return null;
    }
  }

  /**
   * Update a specific task
   */
  async updateTask(taskId: string, updates: Partial<ScheduledTask>): Promise<void> {
    try {
      const config = await this.getConfig();
      const taskIndex = config.tasks.findIndex((t) => t.id === taskId);

      if (taskIndex >= 0) {
        config.tasks[taskIndex] = { ...config.tasks[taskIndex], ...updates };
        await this.updateConfig(config);

        // Reschedule if enabled status changed
        if (updates.enabled !== undefined || updates.time !== undefined) {
          const timer = this.timers.get(taskId);
          if (timer) clearTimeout(timer);
          this.timers.delete(taskId);

          if (config.tasks[taskIndex].enabled) {
            this.scheduleTask(config.tasks[taskIndex]);
          }
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  /**
   * Subscribe to task execution events
   */
  subscribe(listener: (task: ScheduledTask) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Cleanup and destroy scheduler
   */
  destroy(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.listeners = [];
  }
}

export const backgroundScheduler = new BackgroundScheduler();
