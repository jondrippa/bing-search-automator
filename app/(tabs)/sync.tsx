import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { syncService, type SyncData } from '@/lib/sync-service';
import { useColors } from '@/hooks/use-colors';

export default function SyncScreen() {
  const colors = useColors();
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [syncConfig, setSyncConfig] = useState({ enabled: false, syncInterval: 30000 });
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string>('Never');

  useEffect(() => {
    loadSyncData();
    const unsubscribe = syncService.subscribe((data) => {
      setSyncData(data);
      setLastSync(new Date().toLocaleTimeString());
    });

    return () => unsubscribe();
  }, []);

  const loadSyncData = async () => {
    try {
      const data = await syncService.getSyncData();
      const config = await syncService.getSyncConfig();
      const history = await syncService.getSyncHistory();

      setSyncData(data);
      setSyncConfig(config);
      setSyncHistory(history.slice(-10)); // Last 10 entries
    } catch (error) {
      console.error('Error loading sync data:', error);
    }
  };

  const toggleSync = async () => {
    try {
      await syncService.updateSyncConfig({ enabled: !syncConfig.enabled });
      const updated = await syncService.getSyncConfig();
      setSyncConfig(updated);
    } catch (error) {
      console.error('Error toggling sync:', error);
    }
  };

  const updateSyncInterval = async (interval: number) => {
    try {
      await syncService.updateSyncConfig({ syncInterval: interval });
      const updated = await syncService.getSyncConfig();
      setSyncConfig(updated);
    } catch (error) {
      console.error('Error updating sync interval:', error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Sync Status</Text>
          <Text className="mt-2 text-sm text-muted">
            Real-time synchronization with browser extension
          </Text>
        </View>

        {/* Sync Status Card */}
        <View className="mb-6 rounded-lg bg-surface p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold text-muted">SYNC STATUS</Text>
              <Text className="mt-2 text-2xl font-bold text-foreground">
                {syncConfig.enabled ? '🟢 Active' : '🔴 Inactive'}
              </Text>
              <Text className="mt-1 text-xs text-muted">
                Last sync: {lastSync}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleSync}
              className={`rounded-lg px-4 py-2 ${
                syncConfig.enabled ? 'bg-error/20' : 'bg-success/20'
              }`}
            >
              <Text className={syncConfig.enabled ? 'text-error' : 'text-success'}>
                {syncConfig.enabled ? 'Disable' : 'Enable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Sync Data */}
        {syncData && (
          <View className="mb-6 rounded-lg bg-primary/10 p-4">
            <Text className="mb-3 text-sm font-semibold text-primary">CURRENT DATA</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-foreground">Total Points:</Text>
                <Text className="font-semibold text-primary">
                  {syncData.totalPoints.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-foreground">Total Searches:</Text>
                <Text className="font-semibold text-primary">
                  {syncData.totalSearches}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-foreground">Desktop Searches:</Text>
                <Text className="font-semibold text-primary">
                  {syncData.desktopSearches}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-foreground">Mobile Searches:</Text>
                <Text className="font-semibold text-primary">
                  {syncData.mobileSearches}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-foreground">Account Health:</Text>
                <Text className="font-semibold text-success">
                  {syncData.accountHealth.score}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Sync Interval Configuration */}
        <View className="mb-6 rounded-lg bg-surface p-4">
          <Text className="mb-3 text-sm font-semibold text-foreground">SYNC INTERVAL</Text>
          <View className="gap-2">
            {[10000, 30000, 60000, 120000].map((interval) => (
              <TouchableOpacity
                key={interval}
                onPress={() => updateSyncInterval(interval)}
                className={`rounded-lg p-3 ${
                  syncConfig.syncInterval === interval
                    ? 'bg-primary/20'
                    : 'bg-muted/10'
                }`}
              >
                <Text
                  className={
                    syncConfig.syncInterval === interval
                      ? 'font-semibold text-primary'
                      : 'text-foreground'
                  }
                >
                  {interval / 1000}s
                  {syncConfig.syncInterval === interval && ' ✓'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sync History */}
        <View className="mb-6 rounded-lg bg-surface p-4">
          <Text className="mb-3 text-sm font-semibold text-foreground">SYNC HISTORY</Text>
          {syncHistory.length > 0 ? (
            <View className="gap-2">
              {syncHistory.map((entry, index) => (
                <View key={index} className="flex-row justify-between border-b border-border pb-2">
                  <View>
                    <Text className="text-xs text-muted">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </Text>
                    <Text className="text-xs text-muted">
                      {entry.source === 'mobile' ? '📱' : '🖥️'} {entry.source}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-primary">
                      +{entry.points} pts
                    </Text>
                    <Text className="text-xs text-muted">
                      {entry.searches} searches
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted">No sync history yet</Text>
          )}
        </View>

        {/* Info Card */}
        <View className="rounded-lg bg-primary/10 p-4">
          <Text className="text-xs font-semibold text-primary">💡 HOW SYNC WORKS</Text>
          <Text className="mt-2 text-sm text-foreground leading-relaxed">
            Your mobile app and browser extension automatically sync search counts, points, and
            account health status. Enable sync to keep both platforms up-to-date in real-time.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
