/**
 * Sync Manager for Edge Extension
 * Handles real-time synchronization with mobile app
 */

class SyncManager {
  constructor() {
    this.syncData = {
      userId: this.generateUserId(),
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
   * Generate unique user ID
   */
  generateUserId() {
    const stored = localStorage.getItem('extension_user_id');
    if (stored) return stored;

    const userId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('extension_user_id', userId);
    return userId;
  }

  /**
   * Initialize sync system
   */
  initializeSync() {
    this.loadSyncData();
    this.startSync();
    this.setupMessageListener();
  }

  /**
   * Load sync data from storage
   */
  loadSyncData() {
    try {
      const stored = localStorage.getItem('extension_sync_data');
      if (stored) {
        this.syncData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync data:', error);
    }
  }

  /**
   * Save sync data to storage
   */
  saveSyncData() {
    try {
      localStorage.setItem('extension_sync_data', JSON.stringify(this.syncData));
      this.recordSyncHistory();
    } catch (error) {
      console.error('Error saving sync data:', error);
    }
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
   * Record sync history
   */
  recordSyncHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('extension_sync_history') || '[]');
      history.push({
        timestamp: new Date().toISOString(),
        points: this.syncData.totalPoints,
        searches: this.syncData.totalSearches,
      });

      // Keep only last 100 entries
      if (history.length > 100) {
        history.shift();
      }

      localStorage.setItem('extension_sync_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error recording sync history:', error);
    }
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
