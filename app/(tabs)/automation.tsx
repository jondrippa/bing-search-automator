import { ScrollView, Text, View, Pressable, Switch, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { automationEngine, type AutomationConfig, type ActivityLog } from "@/lib/activity-automation";
import * as Haptics from "expo-haptics";

export default function AutomationScreen() {
  const colors = useColors();
  const [config, setConfig] = useState<AutomationConfig>({
    autoCompleteQuizzes: true,
    autoCompleteSurveys: true,
    autoCompleteDailySet: true,
    autoCompleteXboxActivities: false,
    delayBetweenActivities: 2000,
    maxConcurrentActivities: 1,
    stopOnError: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    automationEngine.updateConfig(config);
  }, [config]);

  const handleStartAutomation = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRunning(true);
      setLogs([]);
      setTotalPoints(0);

      const result = await automationEngine.startAutomation();

      setTotalPoints(result.totalPointsEarned);
      setLogs(automationEngine.getLogs());
      setIsRunning(false);

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error("Automation error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsRunning(false);
    }
  };

  const handleStopAutomation = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    automationEngine.stopAutomation();
    setIsRunning(false);
  };

  const handleCompleteDailySet = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRunning(true);
      setLogs([]);
      setTotalPoints(0);

      const result = await automationEngine.completeDailySet();

      setTotalPoints(result.totalPointsEarned);
      setLogs(automationEngine.getLogs());
      setIsRunning(false);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Daily set error:", error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsRunning(false);
    }
  };

  const renderLogItem = ({ item }: { item: ActivityLog }) => (
    <View
      className="rounded-lg p-4 mb-3 flex-row justify-between items-start"
      style={{
        backgroundColor: colors.surface,
        borderLeftWidth: 4,
        borderLeftColor:
          item.status === "success"
            ? colors.success
            : item.status === "failed"
              ? colors.error
              : colors.warning,
      }}
    >
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{item.activityTitle}</Text>
        <Text className="text-sm text-muted mt-2">{item.timestamp}</Text>
        {item.message && <Text className="text-sm text-error mt-2">{item.message}</Text>}
      </View>
      <View className="items-end">
        <Text className="text-xl font-bold text-success">+{item.pointsEarned}</Text>
        <Text className="text-sm text-muted capitalize">{item.status}</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Automation</Text>
            <Text className="text-sm text-muted">Auto-complete activities and earn points</Text>
          </View>

          {/* Status Card */}
          <View
            className="rounded-2xl p-4 gap-3"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-muted">Status</Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: isRunning ? colors.warning : colors.success,
                }}
              >
                <Text className="text-xs font-bold text-white">
                  {isRunning ? "Running" : "Ready"}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-2 border-t" style={{ borderTopColor: colors.border }}>
              <View>
                <Text className="text-xs text-muted mb-1">Points Earned</Text>
                <Text className="text-2xl font-bold text-foreground">{totalPoints}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted mb-1">Activities</Text>
                <Text className="text-2xl font-bold text-foreground">{logs.length}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            {!isRunning ? (
              <>
                <Pressable
                  onPress={handleStartAutomation}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View
                    className="rounded-xl p-4 items-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-base font-bold text-white">Start Full Automation</Text>
                    <Text className="text-xs text-white opacity-80 mt-1">
                      Complete all enabled activities
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={handleCompleteDailySet}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View
                    className="rounded-xl p-4 items-center border"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.primary,
                      borderWidth: 1,
                    }}
                  >
                    <Text className="text-base font-bold text-foreground">Complete Daily Set</Text>
                    <Text className="text-xs text-muted mt-1">
                      Quick daily set completion
                    </Text>
                  </View>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={handleStopAutomation}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <View
                  className="rounded-xl p-4 items-center"
                  style={{ backgroundColor: colors.error }}
                >
                  <Text className="text-base font-bold text-white">Stop Automation</Text>
                </View>
              </Pressable>
            )}
          </View>

          {/* Configuration */}
          <View className="gap-4">
            <Text className="text-base font-semibold text-foreground">Activity Types</Text>

            {/* Quizzes Toggle */}
            <View className="flex-row justify-between items-center p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">🧠 Quizzes</Text>
                <Text className="text-sm text-muted">Auto-complete quizzes</Text>
              </View>
              <Switch
                value={config.autoCompleteQuizzes}
                onValueChange={(value) =>
                  setConfig({ ...config, autoCompleteQuizzes: value })
                }
              />
            </View>

            {/* Surveys Toggle */}
            <View className="flex-row justify-between items-center p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">📋 Surveys</Text>
                <Text className="text-sm text-muted">Auto-complete surveys</Text>
              </View>
              <Switch
                value={config.autoCompleteSurveys}
                onValueChange={(value) =>
                  setConfig({ ...config, autoCompleteSurveys: value })
                }
              />
            </View>

            {/* Daily Set Toggle */}
            <View className="flex-row justify-between items-center p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">✨ Daily Set</Text>
                <Text className="text-sm text-muted">Auto-complete daily tasks</Text>
              </View>
              <Switch
                value={config.autoCompleteDailySet}
                onValueChange={(value) =>
                  setConfig({ ...config, autoCompleteDailySet: value })
                }
              />
            </View>

            {/* Stop on Error Toggle */}
            <View className="flex-row justify-between items-center p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">⚠️ Stop on Error</Text>
                <Text className="text-sm text-muted">Halt if activity fails</Text>
              </View>
              <Switch
                value={config.stopOnError}
                onValueChange={(value) =>
                  setConfig({ ...config, stopOnError: value })
                }
              />
            </View>
          </View>

          {/* Activity Logs */}
          {logs.length > 0 && (
            <View className="gap-3">
              <Text className="text-xl font-semibold text-foreground">Activity Log</Text>
              <FlatList
                data={logs}
                renderItem={renderLogItem}
                keyExtractor={(item, index) => `${item.activityId}-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Info Box */}
            <View
              className="rounded-2xl p-6 gap-3"
              style={{
                backgroundColor: colors.surface,
                borderLeftWidth: 6,
                borderLeftColor: colors.primary,
              }}
            >
              <Text className="text-base font-semibold text-foreground">💡 How It Works</Text>
              <Text className="text-base text-muted leading-relaxed">
                The automation engine automatically completes quizzes, surveys, and daily set activities. Each activity is completed with realistic delays to avoid detection. All earned points are recorded in your statistics.
              </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
