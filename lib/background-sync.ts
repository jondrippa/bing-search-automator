import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { MicrosoftOAuthService } from "./microsoft-oauth";
import { trpc } from "./trpc";

const BACKGROUND_SYNC_TASK = "background-sync-bing-rewards";

/**
 * Register background sync task
 */
export async function registerBackgroundSyncTask() {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      return;
    }

    // Define the background task
    TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
      try {
        // Check if user is authenticated with Microsoft
        const isAuthenticated = await MicrosoftOAuthService.isAuthenticated();
        if (!isAuthenticated) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Get access token
        const token = await MicrosoftOAuthService.getToken();
        if (!token || typeof token !== "object" || !("accessToken" in token)) {
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        // Fetch Bing Rewards data
        const bingData = await MicrosoftOAuthService.getBingRewardsData(
          (token as any).accessToken
        );

        if (bingData) {
          // Update metrics in database
          // This would typically call your backend API
          console.log("Background sync completed:", bingData);
          return BackgroundFetch.BackgroundFetchResult.NewData;
        }

        return BackgroundFetch.BackgroundFetchResult.NoData;
      } catch (error) {
        console.error("Background sync error:", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    });

    // Register the task with the system
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 60 * 60, // 1 hour
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log("Background sync task registered");
  } catch (error) {
    console.error("Error registering background sync task:", error);
  }
}

/**
 * Unregister background sync task
 */
export async function unregisterBackgroundSyncTask() {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      console.log("Background sync task unregistered");
    }
  } catch (error) {
    console.error("Error unregistering background sync task:", error);
  }
}

/**
 * Check if background sync task is registered
 */
export async function isBackgroundSyncRegistered() {
  try {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  } catch (error) {
    console.error("Error checking background sync registration:", error);
    return false;
  }
}

/**
 * Manually trigger background sync
 */
export async function triggerBackgroundSync() {
  try {
    const isAuthenticated = await MicrosoftOAuthService.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error("User is not authenticated with Microsoft");
    }

    const token = await MicrosoftOAuthService.getToken();
    if (!token || typeof token !== "object" || !("accessToken" in token)) {
      throw new Error("Failed to get access token");
    }

    // Fetch Bing Rewards data
    const bingData = await MicrosoftOAuthService.getBingRewardsData(
      (token as any).accessToken
    );

    if (bingData) {
      console.log("Manual sync completed:", bingData);
      return { success: true, data: bingData };
    }

    return { success: false, error: "No data returned" };
  } catch (error) {
    console.error("Manual sync error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
