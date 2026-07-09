/**
 * Sync Service
 * Handles real-time synchronization between mobile app and browser extension
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncData {
  userId: string;
  totalPoints: number;
  totalSearches: number;
  desktopSearches: number;
  mobileSearches: number;
  streakDays: number;
  totalActivities: number;
  lastUpdated: string;
  source: 'mobile' | 'extension';
  accountHealth: {
    score: number;
    flags: string[];
  };
}

export interface SyncConfig {
  enabled: boolean;
  syncInterval: number; // milliseconds
  lastSync: string;
  syncUrl?: string;
}

const SYNC_DATA_KEY = 'sync_data';
const SYNC_CONFIG_KEY = 'sync_config';
const SYNC_HISTORY_KEY = 'sync_history';

class SyncService {
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: ((data: SyncData) => void)[] = [];

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    try {
      const config = await this.getSyncConfig();
      if (config.enabled) {
        this.startSync();
      }
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  /**
   * Get sync configuration
   */
  async getSyncConfig(): Promise<SyncConfig> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
      if (!stored) {
        const defaultConfig: SyncConfig = {
          enabled: true,
          syncInterval: 30000, // 30 seconds
          lastSync: new Date().toISOString(),
        };
        await AsyncStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(defaultConfig));
        return defaultConfig;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting sync config:', error);
      return {
        enabled: false,
        syncInterval: 30000,
        lastSync: new Date().toISOString(),
      };
    }
  }

  /**
   * Update sync configuration
   */
  async updateSyncConfig(config: Partial<SyncConfig>): Promise<void> {
    try {
      const current = await this.getSyncConfig();
      const updated = { ...current, ...config };
      await AsyncStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(updated));

      // Restart sync if interval changed
      if (config.syncInterval && config.syncInterval !== current.syncInterval) {
        this.stopSync();
        if (updated.enabled) {
          this.startSync();
        }
      }
    } catch (error) {
      console.error('Error updating sync config:', error);
    }
  }

  /**
   * Publish sync data from mobile app
   */
  async publishData(data: Omit<SyncData, 'lastUpdated'>): Promise<void> {
    try {
      const syncData: SyncData = {
        ...data,
        source: 'mobile',
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(SYNC_DATA_KEY, JSON.stringify(syncData));
      await this.recordSyncHistory(syncData);
      this.notifyListeners(syncData);

      // Attempt to sync to extension via message
      await this.sendToExtension(syncData);
    } catch (error) {
      console.error('Error publishing data:', error);
    }
  }

  /**
   * Receive sync data from extension
   */
  async receiveData(data: SyncData): Promise<void> {
    try {
      // Merge with existing data
      const existing = await this.getSyncData();
      if (existing && data.lastUpdated > existing.lastUpdated) {
        // Extension data is newer
        await AsyncStorage.setItem(SYNC_DATA_KEY, JSON.stringify(data));
        await this.recordSyncHistory(data);
        this.notifyListeners(data);
      }
    } catch (error) {
      console.error('Error receiving data:', error);
    }
  }

  /**
   * Get current sync data
   */
  async getSyncData(): Promise<SyncData | null> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting sync data:', error);
      return null;
    }
  }

  /**
   * Subscribe to sync data changes
   */
  subscribe(listener: (data: SyncData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of data changes
   */
  private notifyListeners(data: SyncData): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });
  }

  /**
   * Start automatic sync
   */
  private startSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    const config = this.getSyncConfig();
    config.then((cfg) => {
      this.syncInterval = setInterval(() => {
        this.performSync();
      }, cfg.syncInterval);
    });
  }

  /**
   * Stop automatic sync
   */
  private stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Perform sync operation
   */
  private async performSync(): Promise<void> {
    try {
      const data = await this.getSyncData();
      if (data) {
        await this.sendToExtension(data);
        await this.updateSyncConfig({ lastSync: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error performing sync:', error);
    }
  }

  /**
   * Send data to extension via message passing
   */
  private async sendToExtension(data: SyncData): Promise<void> {
    try {
      // This would be implemented in a native module or via a bridge
      // For now, we'll store it and the extension can poll for it
      console.log('Sync data ready for extension:', data);
    } catch (error) {
      console.error('Error sending to extension:', error);
    }
  }

  /**
   * Record sync history for debugging
   */
  private async recordSyncHistory(data: SyncData): Promise<void> {
    try {
      const history = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
      const entries = history ? JSON.parse(history) : [];

      entries.push({
        timestamp: new Date().toISOString(),
        source: data.source,
        points: data.totalPoints,
        searches: data.totalSearches,
      });

      // Keep only last 100 entries
      if (entries.length > 100) {
        entries.shift();
      }

      await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error recording sync history:', error);
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(): Promise<any[]> {
    try {
      const history = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting sync history:', error);
      return [];
    }
  }

  /**
   * Clear sync data
   */
  async clearSyncData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SYNC_DATA_KEY);
      await AsyncStorage.removeItem(SYNC_HISTORY_KEY);
      console.log('Sync data cleared');
    } catch (error) {
      console.error('Error clearing sync data:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopSync();
    this.listeners = [];
  }
}

export const syncService = new SyncService();
