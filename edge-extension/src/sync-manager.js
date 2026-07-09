/**
 * Sync Manager for Edge Extension
 * Handles real-time synchronization with mobile app
 */

class SyncManager {
  constructor() {
    this.syncData = {
      userId: null,
      totalPoints: 0,
      totalSearches: 0,
      desktopSearches: 0,
      mobileSearches: 0,
      streakDays: 0,
      totalActivities: 0,
      lastUpdated: new Date().toISOString(),
      source: 'extension',
      accountHealth: {
        score: 100,
        flags: [],
      },
    };
    this.syncInterval = null;
    this.listeners = [];
    this.syncConfig = {
      enabled: true,
      syncInterval: 30000, // 30 seconds
      lastSync: new Date().toISOString(),
    };
    this.initializeSync();
  }

  /**
   * Generate unique user ID using Chrome Storage
   */
  async generateUserId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['extension_user_id'], (result) => {
        if (result.extension_user_id) {
          resolve(result.extension_user_id);
        } else {
          const userId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          chrome.storage.local.set({ extension_user_id: userId }, () => {
            resolve(userId);
          });
        }
      });
    });
  }

  /**
   * Initialize sync system
   */
  async initializeSync() {
    // Generate user ID first
    this.syncData.userId = await this.generateUserId();
    
    // Load existing sync data
    await this.loadSyncData();
    
    // Start sync and setup listeners
    this.startSync();
    this.setupMessageListener();
  }

  /**
   * Load sync data from Chrome Storage
   */
  loadSyncData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['extension_sync_data'], (result) => {
        try {
          if (result.extension_sync_data) {
            this.syncData = {
              ...this.syncData,
              ...result.extension_sync_data,
            };
          }
          resolve();
        } catch (error) {
          console.error('Error loading sync data:', error);
          resolve();
        }
      });
    });
  }

  /**
   * Save sync data to Chrome Storage
   */
  saveSyncData() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.set({ extension_sync_data: this.syncData }, () => {
          this.recordSyncHistory();
          resolve();
        });
      } catch (error) {
        console.error('Error saving sync data:', error);
        resolve();
      }
    });
  }

  /**
   * Update search counts
   */
  updateSearchCount(type = 'desktop') {
    this.syncData.totalSearches++;
    if (type === 'desktop') {
      this.syncData.desktopSearches++;
    } else if (type === 'mobile') {
      this.syncData.mobileSearches++;
    }
    this.syncData.lastUpdated = new Date().toISOString();
    this.saveSyncData();
    this.notifyListeners();
  }

  /**
   * Update points
   */
  updatePoints(points) {
    this.syncData.totalPoints += points;
    this.syncData.lastUpdated = new Date().toISOString();
    this.saveSyncData();
    this.notifyListeners();
  }

  /**
   * Update account health
   */
  updateAccountHealth(score, flags = []) {
    this.syncData.accountHealth = { score, flags };
    this.syncData.lastUpdated = new Date().toISOString();
    this.saveSyncData();
    this.notifyListeners();
  }

  /**
   * Get current sync data
   */
  getSyncData() {
    return { ...this.syncData };
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.syncData);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  /**
   * Start automatic sync
   */
  startSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.syncConfig.syncInterval);
  }

  /**
   * Stop sync
   */
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform sync operation
   */
  async performSync() {
    try {
      // Send data to mobile app via message passing
      chrome.runtime.sendMessage(
        {
          type: 'SYNC_DATA',
          data: this.syncData,
        },
        (response) => {
          if (response && response.success) {
            console.log('Sync successful');
            this.syncConfig.lastSync = new Date().toISOString();
          }
        }
      );
    } catch (error) {
      console.error('Error performing sync:', error);
    }
  }

  /**
   * Record sync history using Chrome Storage
   */
  recordSyncHistory() {
    chrome.storage.local.get(['extension_sync_history'], (result) => {
      try {
        const history = result.extension_sync_history || [];
        history.push({
          timestamp: new Date().toISOString(),
          points: this.syncData.totalPoints,
          searches: this.syncData.totalSearches,
        });

        // Keep only last 100 entries
        if (history.length > 100) {
          history.shift();
        }

        chrome.storage.local.set({ extension_sync_history: history });
      } catch (error) {
        console.error('Error recording sync history:', error);
      }
    });
  }

  /**
   * Setup message listener for incoming data
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'SYNC_DATA_FROM_MOBILE') {
        // Merge mobile data if newer
        if (request.data.lastUpdated > this.syncData.lastUpdated) {
          this.syncData = {
            ...this.syncData,
            ...request.data,
            source: 'extension', // Keep extension as source
          };
          this.saveSyncData();
          this.notifyListeners();
        }
        sendResponse({ success: true });
      } else if (request.type === 'GET_SYNC_DATA') {
        sendResponse({ data: this.syncData });
      } else if (request.type === 'UPDATE_SYNC_CONFIG') {
        this.syncConfig = { ...this.syncConfig, ...request.config };
        this.stopSync();
        this.startSync();
        sendResponse({ success: true });
      }
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopSync();
    this.listeners = [];
  }
}

// Initialize sync manager
const syncManager = new SyncManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = syncManager;
}
