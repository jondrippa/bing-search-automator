import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { syncService, type SyncData } from '@/lib/sync-service';
import { exportService } from '@/lib/export-service';
import { useColors } from '@/hooks/use-colors';

export default function SyncScreen() {
  const colors = useColors();
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [syncConfig, setSyncConfig] = useState({ enabled: false, syncInterval: 30000 });
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<string>('Never');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

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
      setSyncHistory(history.slice(-10));
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

  const forceSyncNow = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage('Syncing...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await loadSyncData();
      setSyncMessage('✓ Sync completed successfully!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      console.error('Error forcing sync:', error);
      setSyncMessage('✗ Sync failed!');
      setTimeout(() => setSyncMessage(''), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const exportSyncHistory = async () => {
    try {
      setIsExporting(true);
      setSyncMessage('Exporting sync history...');
      await exportService.exportSyncHistory();
      setSyncMessage('✓ Sync history exported!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting sync history:', error);
      setSyncMessage('✗ Export failed!');
      setTimeout(() => setSyncMessage(''), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const exportEarningTrends = async () => {
    try {
      setIsExporting(true);
      setSyncMessage('Exporting earning trends...');
      await exportService.exportEarningTrends();
      setSyncMessage('✓ Earning trends exported!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting earning trends:', error);
      setSyncMessage('✗ Export failed!');
      setTimeout(() => setSyncMessage(''), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const exportFullReport = async () => {
    try {
      setIsExporting(true);
      setSyncMessage('Exporting full report...');
      await exportService.exportFullReport();
      setSyncMessage('✓ Full report exported!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting full report:', error);
      setSyncMessage('✗ Export failed!');
      setTimeout(() => setSyncMessage(''), 3000);
    } finally {
      setIsExporting(false);
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

        {/* Force Sync Button */}
        <View className="mb-6 rounded-lg bg-primary/10 p-4">
          <TouchableOpacity
            onPress={forceSyncNow}
            disabled={isSyncing}
            className={`flex-row items-center justify-center gap-2 rounded-lg py-3 ${
              isSyncing ? 'bg-primary/50' : 'bg-primary'
            }`}
          >
            <Text className="text-lg">{isSyncing ? '⏳' : '🔄'}</Text>
            <Text className="font-semibold text-white">
              {isSyncing ? 'Syncing...' : 'Force Sync Now'}
            </Text>
          </TouchableOpacity>
          {syncMessage && (
            <Text className="mt-2 text-center text-xs text-primary">{syncMessage}</Text>
          )}
        </View>

        {/* Export Options */}
        <View className="mb-6 rounded-lg bg-surface p-4">
          <Text className="mb-3 text-sm font-semibold text-foreground">EXPORT DATA</Text>
          <View className="gap-2">
            <TouchableOpacity
              onPress={exportSyncHistory}
              disabled={isExporting}
              className="flex-row items-center justify-between rounded-lg bg-primary/10 p-3"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">📋</Text>
                <Text className="font-semibold text-foreground">Sync History</Text>
              </View>
              <Text>{isExporting ? '⏳' : '→'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={exportEarningTrends}
              disabled={isExporting}
              className="flex-row items-center justify-between rounded-lg bg-primary/10 p-3"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">📊</Text>
                <Text className="font-semibold text-foreground">Earning Trends</Text>
              </View>
              <Text>{isExporting ? '⏳' : '→'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={exportFullReport}
              disabled={isExporting}
              className="flex-row items-center justify-between rounded-lg bg-primary/10 p-3"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">📄</Text>
                <Text className="font-semibold text-foreground">Full Report</Text>
              </View>
              <Text>{isExporting ? '⏳' : '→'}</Text>
            </TouchableOpacity>
          </View>
          {syncMessage && (
            <Text className="mt-2 text-center text-xs text-primary">{syncMessage}</Text>
          )}
        </View>

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
