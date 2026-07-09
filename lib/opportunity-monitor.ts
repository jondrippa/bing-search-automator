/**
 * Opportunity Monitor
 * Monitors for high-value opportunities and expiring quizzes
 * Sends notifications with deep links when opportunities are detected
 */

import { notificationService } from './notification-service';
import { fetchLiveOpportunities, getExpiringOpportunities } from './opportunities-tracker-live';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RewardsActivity } from './bing-rewards-api';

const MONITOR_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const HIGH_VALUE_THRESHOLD = 100; // Points
const EXPIRING_SOON_THRESHOLD = 30; // Minutes
const NOTIFIED_OPPORTUNITIES_KEY = 'notified_opportunities';

interface NotifiedOpportunity {
  id: string;
  timestamp: number;
}

class OpportunityMonitor {
  private monitoringActive = false;
  private monitorInterval?: ReturnType<typeof setInterval>;
  private notifiedOpportunities: Set<string> = new Set();

  /**
   * Start monitoring for opportunities
   */
  async startMonitoring(): Promise<void> {
    if (this.monitoringActive) {
      console.log('Opportunity monitoring already active');
      return;
    }

    console.log('Starting opportunity monitoring...');
    this.monitoringActive = true;

    // Load previously notified opportunities
    await this.loadNotifiedOpportunities();

    // Initial check
    await this.checkOpportunities();

    // Set up interval
    this.monitorInterval = setInterval(() => {
      this.checkOpportunities();
    }, MONITOR_INTERVAL);
  }

  /**
   * Stop monitoring for opportunities
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
    this.monitoringActive = false;
    console.log('Opportunity monitoring stopped');
  }

  /**
   * Check for opportunities and send notifications
   */
  private async checkOpportunities(): Promise<void> {
    try {
      console.log('Checking for opportunities...');
      const opportunities = await fetchLiveOpportunities();

      if (!opportunities || opportunities.length === 0) {
        console.log('No opportunities found');
        return;
      }

      // Check for high-value opportunities
      await this.checkHighValueOpportunities(opportunities);

      // Check for expiring opportunities
      await this.checkExpiringOpportunities(opportunities);
    } catch (error) {
      console.error('Error checking opportunities:', error);
    }
  }

  /**
   * Check for high-value opportunities (100+ points)
   */
  private async checkHighValueOpportunities(
    opportunities: RewardsActivity[]
  ): Promise<void> {
    const highValueOpps = opportunities.filter(
      (opp) =>
        opp.pointsAvailable >= HIGH_VALUE_THRESHOLD &&
        !opp.isCompleted &&
        !this.notifiedOpportunities.has(opp.id)
    );

    for (const opp of highValueOpps) {
      console.log(`Found high-value opportunity: ${opp.title} (${opp.pointsAvailable} pts)`);

      const categoryEmoji = this.getCategoryEmoji(opp.category);
      const deepLink = `manusmicrosoft://opportunity/${opp.id}`;

      await notificationService.notifyHighValueOpportunity({
        opportunityId: opp.id,
        title: `${categoryEmoji} High-Value: ${opp.title}`,
        body: `${opp.description || 'Complete this activity'} for ${opp.pointsAvailable} points`,
        pointsValue: opp.pointsAvailable,
        category: opp.category,
        deepLink,
      });

      // Mark as notified
      this.notifiedOpportunities.add(opp.id);
      await this.saveNotifiedOpportunities();
    }
  }

  /**
   * Check for expiring opportunities
   */
  private async checkExpiringOpportunities(
    opportunities: RewardsActivity[]
  ): Promise<void> {
    const expiringOpps = opportunities.filter(
      (opp) =>
        opp.expiresAt &&
        !opp.isCompleted &&
        !this.notifiedOpportunities.has(`expiring_${opp.id}`)
    );

    for (const opp of expiringOpps) {
      const now = new Date();
      const expiresAt = new Date(opp.expiresAt!);
      const minutesRemaining = Math.floor(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60)
      );

      if (minutesRemaining > 0 && minutesRemaining <= EXPIRING_SOON_THRESHOLD) {
        console.log(`Found expiring opportunity: ${opp.title} (${minutesRemaining} min remaining)`);

        const categoryEmoji = this.getCategoryEmoji(opp.category);
        const deepLink = `manusmicrosoft://opportunity/${opp.id}`;

        await notificationService.notifyExpiringOpportunity({
          opportunityId: opp.id,
          title: `${categoryEmoji} ${opp.title}`,
          body: `${opp.description || 'Complete this activity'} for ${opp.pointsAvailable} points`,
          pointsValue: opp.pointsAvailable,
          category: opp.category,
          expiresIn: minutesRemaining,
          deepLink,
        });

        // Mark as notified
        this.notifiedOpportunities.add(`expiring_${opp.id}`);
        await this.saveNotifiedOpportunities();
      }
    }
  }

  /**
   * Get emoji for opportunity category
   */
  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      quiz: '🧠',
      survey: '📋',
      shopping: '🛍️',
      xbox: '🎮',
      'daily-task': '✅',
      bonus: '🎁',
      trending: '🔥',
    };
    return emojis[category] || '📌';
  }

  /**
   * Load previously notified opportunities from storage
   */
  private async loadNotifiedOpportunities(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFIED_OPPORTUNITIES_KEY);
      if (stored) {
        const notified: NotifiedOpportunity[] = JSON.parse(stored);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;

        // Only keep notifications from the last hour
        const recent = notified.filter((n) => n.timestamp > oneHourAgo);
        this.notifiedOpportunities = new Set(recent.map((n) => n.id));

        console.log(`Loaded ${this.notifiedOpportunities.size} recent notifications`);
      }
    } catch (error) {
      console.error('Error loading notified opportunities:', error);
    }
  }

  /**
   * Save notified opportunities to storage
   */
  private async saveNotifiedOpportunities(): Promise<void> {
    try {
      const notified: NotifiedOpportunity[] = Array.from(this.notifiedOpportunities).map(
        (id) => ({
          id,
          timestamp: Date.now(),
        })
      );
      await AsyncStorage.setItem(NOTIFIED_OPPORTUNITIES_KEY, JSON.stringify(notified));
    } catch (error) {
      console.error('Error saving notified opportunities:', error);
    }
  }

  /**
   * Clear notification history
   */
  async clearNotificationHistory(): Promise<void> {
    try {
      this.notifiedOpportunities.clear();
      await AsyncStorage.removeItem(NOTIFIED_OPPORTUNITIES_KEY);
      console.log('Notification history cleared');
    } catch (error) {
      console.error('Error clearing notification history:', error);
    }
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoringActive;
  }
}

export const opportunityMonitor = new OpportunityMonitor();
