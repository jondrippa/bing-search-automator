import { ScrollView, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { backgroundTaskScheduler, type ScheduleConfig } from '@/lib/background-task-scheduler';
import { useColors } from '@/hooks/use-colors';

export default function ScheduleScreen() {
  const colors = useColors();
  const [config, setConfig] = useState<ScheduleConfig>(backgroundTaskScheduler.getScheduleConfig());
  const [nextRunTime, setNextRunTime] = useState<string>('');

  useEffect(() => {
    updateNextRunTime();
  }, [config]);

  const updateNextRunTime = () => {
    const next = backgroundTaskScheduler.getNextScheduledTime();
    setNextRunTime(next);
  };

  const handleToggleEnabled = async (value: boolean) => {
    if (value) {
      await backgroundTaskScheduler.enableScheduledAutomation();
    } else {
      await backgroundTaskScheduler.disableScheduledAutomation();
    }
    setConfig(backgroundTaskScheduler.getScheduleConfig());
  };

  const handleUpdateConfig = async (updates: Partial<ScheduleConfig>) => {
    await backgroundTaskScheduler.updateScheduleConfig(updates);
    setConfig(backgroundTaskScheduler.getScheduleConfig());
  };

  const toggleTime = (time: string) => {
    const newTimes = config.times.includes(time)
      ? config.times.filter((t) => t !== time)
      : [...config.times, time].sort();
    handleUpdateConfig({ times: newTimes });
  };

  const scheduleOptions = ['07:00', '12:00', '16:00', '20:00', '23:00'];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Scheduled Automation</Text>
          <Text className="mt-2 text-sm text-muted">
            Run searches and activities automatically at set times
          </Text>
        </View>

        {/* Enable Toggle */}
        <View className="mb-6 flex-row items-center justify-between rounded-lg bg-surface p-4">
          <View>
            <Text className="text-lg font-semibold text-foreground">Enable Scheduling</Text>
            <Text className="text-xs text-muted">
              {config.enabled ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Switch
            value={config.enabled}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {config.enabled && (
          <>
            {/* Next Run Time */}
            <View className="mb-6 rounded-lg bg-primary/10 p-4">
              <Text className="text-xs font-semibold text-primary">NEXT SCHEDULED RUN</Text>
              <Text className="mt-2 text-2xl font-bold text-foreground">{nextRunTime}</Text>
              <Text className="mt-1 text-xs text-muted">
                Automation will run at this time if enabled
              </Text>
            </View>

            {/* Schedule Times */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold text-foreground">Select Times</Text>
              <View className="gap-2">
                {scheduleOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => toggleTime(time)}
                    className={`flex-row items-center rounded-lg p-3 ${
                      config.times.includes(time)
                        ? 'bg-primary'
                        : 'bg-surface border border-border'
                    }`}
                  >
                    <View
                      className={`h-5 w-5 rounded border-2 ${
                        config.times.includes(time)
                          ? 'border-white bg-white'
                          : 'border-muted'
                      }`}
                    >
                      {config.times.includes(time) && (
                        <Text className="text-center text-xs font-bold text-primary">✓</Text>
                      )}
                    </View>
                    <Text
                      className={`ml-3 text-base font-medium ${
                        config.times.includes(time)
                          ? 'text-white'
                          : 'text-foreground'
                      }`}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Search Mode */}
            <View className="mb-6">
              <Text className="mb-3 text-lg font-semibold text-foreground">Search Mode</Text>
              <View className="gap-2">
                {['desktop', 'mobile', 'both'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() =>
                      handleUpdateConfig({ searchMode: mode as 'desktop' | 'mobile' | 'both' })
                    }
                    className={`rounded-lg p-3 ${
                      config.searchMode === mode ? 'bg-primary' : 'bg-surface border border-border'
                    }`}
                  >
                    <Text
                      className={`text-base font-medium ${
                        config.searchMode === mode ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {mode === 'desktop'
                        ? '🖥️ Desktop Only'
                        : mode === 'mobile'
                          ? '📱 Mobile Only'
                          : '🔄 Both Desktop & Mobile'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Additional Options */}
            <View className="mb-6 gap-3">
              <View className="flex-row items-center justify-between rounded-lg bg-surface p-4">
                <Text className="text-base font-medium text-foreground">Enable Activities</Text>
                <Switch
                  value={config.enableActivities}
                  onValueChange={(value) =>
                    handleUpdateConfig({ enableActivities: value })
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              <View className="flex-row items-center justify-between rounded-lg bg-surface p-4">
                <Text className="text-base font-medium text-foreground">
                  Pause on Account Warnings
                </Text>
                <Switch
                  value={config.pauseOnAccountWarnings}
                  onValueChange={(value) =>
                    handleUpdateConfig({ pauseOnAccountWarnings: value })
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            {/* Info Box */}
            <View className="rounded-lg bg-warning/10 p-4">
              <Text className="text-xs font-semibold text-warning">ℹ️ IMPORTANT</Text>
              <Text className="mt-2 text-xs text-foreground leading-relaxed">
                Scheduled automation runs in the background when the app is closed. Ensure your
                device has sufficient battery and internet connection. Automation will pause if
                account warnings are detected.
              </Text>
            </View>
          </>
        )}

        {!config.enabled && (
          <View className="rounded-lg bg-muted/10 p-4">
            <Text className="text-sm text-foreground">
              Enable scheduled automation above to set up automatic searches and activities at
              specific times each day.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
