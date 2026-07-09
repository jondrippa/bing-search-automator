/**
 * Notification Service
 * Handles push notifications with deep linking for Bing Rewards opportunities
 */

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  opportunityId: string;
  title: string;
  body: string;
  pointsValue: number;
  category: string;
  expiresIn?: number; // minutes
  deepLink: string;
}

class NotificationService {
  private expoPushToken?: string;

  /**
   * Initialize notifications and request permissions
   */
  async initialize(): Promise<void> {
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Get Expo push token

      // Set up notification response listener
      this.setupNotificationListener();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  /**
   * Set up listener for notification responses
   */
  private setupNotificationListener(): void {
    // Handle notification taps
    Notifications.addNotificationResponseReceivedListener((response) => {
      const { deepLink } = response.notification.request.content.data;
      if (deepLink) {
        console.log('Opening deep link:', deepLink);
        // Deep link handling is done via Linking.addEventListener in the app
      }
    });
  }

  /**
   * Send local notification for high-value opportunity
   */
  async notifyHighValueOpportunity(payload: NotificationPayload): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          badge: 1,
          sound: 'default',
          data: {
            opportunityId: payload.opportunityId,
            category: payload.category,
            pointsValue: payload.pointsValue,
            deepLink: payload.deepLink,
          },
        },
        trigger: null,
      });
      console.log('High-value opportunity notification sent:', payload.title);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send notification for expiring opportunity
   */
  async notifyExpiringOpportunity(payload: NotificationPayload): Promise<void> {
    try {
      const minutesRemaining = payload.expiresIn || 60;
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${payload.title} Expiring Soon!`,
          body: `${payload.body} - Expires in ${minutesRemaining} minutes`,
          badge: 1,
          sound: 'default',
          data: {
            opportunityId: payload.opportunityId,
            category: payload.category,
            pointsValue: payload.pointsValue,
            deepLink: payload.deepLink,
            isExpiring: true,
          },
        },
        trigger: null,
      });
      console.log('Expiring opportunity notification sent:', payload.title);
    } catch (error) {
      console.error('Error sending expiring notification:', error);
    }
  }

  /**
   * Send notification for quiz completion
   */
  async notifyQuizAvailable(payload: NotificationPayload): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🧠 ${payload.title}`,
          body: `${payload.body} - Earn ${payload.pointsValue} points`,
          badge: 1,
          sound: 'default',
          data: {
            opportunityId: payload.opportunityId,
            category: 'quiz',
            pointsValue: payload.pointsValue,
            deepLink: payload.deepLink,
          },
        },
        trigger: null,
      });
      console.log('Quiz notification sent:', payload.title);
    } catch (error) {
      console.error('Error sending quiz notification:', error);
    }
  }

  /**
   * Send notification for automation status
   */
  async notifyAutomationStatus(
    status: 'started' | 'completed' | 'paused' | 'error',
    details: {
      pointsEarned?: number;
      activitiesCompleted?: number;
      errorMessage?: string;
    }
  ): Promise<void> {
    try {
      const titles = {
        started: '🚀 Automation Started',
        completed: '✅ Automation Complete',
        paused: '⏸️ Automation Paused',
        error: '❌ Automation Error',
      };

      const bodies = {
        started: 'Searching and completing activities...',
        completed: `Earned ${details.pointsEarned} points from ${details.activitiesCompleted} activities`,
        paused: 'Automation has been paused',
        error: details.errorMessage || 'An error occurred during automation',
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: titles[status],
          body: bodies[status],
          badge: 1,
          sound: 'default',
          data: {
            status,
            ...details,
          },
        },
        trigger: null,
      });
      console.log(`Automation ${status} notification sent`);
    } catch (error) {
      console.error('Error sending automation notification:', error);
    }
  }

  /**
   * Send notification for account health warning
   */
  async notifyAccountHealthWarning(
    severity: 'warning' | 'critical',
    message: string
  ): Promise<void> {
    try {
      const icon = severity === 'critical' ? '🚨' : '⚠️';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${icon} Account Health Alert`,
          body: message,
          badge: 1,
          sound: 'default',
          data: {
            severity,
            type: 'account-health',
          },
        },
        trigger: null,
      });
      console.log(`Account health ${severity} notification sent`);
    } catch (error) {
      console.error('Error sending account health notification:', error);
    }
  }

  /**
   * Get push token (for backend integration)
   */
  getPushToken(): string | undefined {
    return this.expoPushToken;
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * Cancel specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
