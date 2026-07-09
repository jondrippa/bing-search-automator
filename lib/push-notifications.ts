import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
}

/**
 * Initialize push notifications
 */
export async function initializePushNotifications() {
  try {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });

    // Request permissions
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Failed to get push notification permissions");
        return false;
      }

      return true;
    } else {
      console.warn("Push notifications only work on physical devices");
      return false;
    }
  } catch (error) {
    console.error("Error initializing push notifications:", error);
    return false;
  }
}

/**
 * Get push notification token
 */
export async function getPushNotificationToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (error) {
    console.error("Error getting push notification token:", error);
    return null;
  }
}

/**
 * Send local notification
 */
export async function sendLocalNotification(payload: NotificationPayload) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: payload.badge || 1,
        sound: payload.sound || "default",
      },
      trigger: null,
    });
  } catch (error) {
    console.error("Error sending local notification:", error);
  }
}

/**
 * Schedule notification for specific time
 */
export async function scheduleNotification(
  payload: NotificationPayload,
  delaySeconds: number
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: payload.badge || 1,
        sound: payload.sound || "default",
      },
      trigger: { seconds: Math.max(1, delaySeconds) },
    } as any);
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}

/**
 * Notification triggers for Bing Rewards events
 */
export const NotificationTriggers = {
  /**
   * New high-value opportunity available
   */
  async newHighValueOpportunity(title: string, points: number, expiresIn: number) {
    await sendLocalNotification({
      title: "New Opportunity!",
      body: `${title} - ${points} points (expires in ${expiresIn} hours)`,
      data: {
        type: "opportunity",
        points: points.toString(),
      },
      badge: 1,
    });
  },

  /**
   * Daily quota approaching
   */
  async dailyQuotaWarning(searchesCompleted: number, quota: number) {
    const remaining = quota - searchesCompleted;
    await sendLocalNotification({
      title: "Daily Quota Warning",
      body: `You've completed ${searchesCompleted}/${quota} searches. ${remaining} remaining!`,
      data: {
        type: "quota_warning",
        completed: searchesCompleted.toString(),
        quota: quota.toString(),
      },
      badge: 2,
    });
  },

  /**
   * Daily quota completed
   */
  async dailyQuotaCompleted(pointsEarned: number) {
    await sendLocalNotification({
      title: "Daily Quota Completed!",
      body: `Great job! You earned ${pointsEarned} points today.`,
      data: {
        type: "quota_completed",
        points: pointsEarned.toString(),
      },
      badge: 1,
    });
  },

  /**
   * Opportunity expiring soon
   */
  async opportunityExpiringWarning(title: string, expiresIn: number) {
    await sendLocalNotification({
      title: "Opportunity Expiring Soon",
      body: `${title} expires in ${expiresIn} minutes!`,
      data: {
        type: "opportunity_expiring",
        expiresIn: expiresIn.toString(),
      },
      badge: 1,
    });
  },

  /**
   * Account milestone reached
   */
  async milestonReached(milestone: number) {
    await sendLocalNotification({
      title: "Milestone Reached!",
      body: `Congratulations! You've earned ${milestone} points!`,
      data: {
        type: "milestone",
        points: milestone.toString(),
      },
      badge: 1,
    });
  },

  /**
   * Account health warning
   */
  async accountHealthWarning(issue: string) {
    await sendLocalNotification({
      title: "Account Health Alert",
      body: issue,
      data: {
        type: "account_health",
        issue,
      },
      badge: 2,
    });
  },

  /**
   * Sync completed
   */
  async syncCompleted(pointsAdded: number) {
    await sendLocalNotification({
      title: "Sync Complete",
      body: `Your data has been updated. +${pointsAdded} points!`,
      data: {
        type: "sync_complete",
        points: pointsAdded.toString(),
      },
      badge: 1,
    });
  },
};

/**
 * Get notification preferences
 */
export async function getNotificationPreferences() {
  try {
    const prefs = await AsyncStorage.getItem("notification_preferences");
    if (prefs) {
      return JSON.parse(prefs);
    }
    return {
      newOpportunities: true,
      quotaWarnings: true,
      quotaCompleted: true,
      expiringOpportunities: true,
      milestones: true,
      accountHealth: true,
      syncUpdates: true,
    };
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return null;
  }
}

/**
 * Set notification preferences
 */
export async function setNotificationPreferences(preferences: Record<string, boolean>) {
  try {
    await AsyncStorage.setItem("notification_preferences", JSON.stringify(preferences));
  } catch (error) {
    console.error("Error setting notification preferences:", error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
}
