import { ScrollView, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { backgroundScheduler, type ScheduledTask, type ScheduleConfig } from '@/lib/background-scheduler';
import { useColors } from '@/hooks/use-colors';

export default function BackgroundSchedulerScreen() {
  const colors = useColors();
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
    loadHistory();

    // Subscribe to task execution events
    const unsubscribe = backgroundScheduler.subscribe((task) => {
      loadHistory();
    });

    return () => unsubscribe();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await backgroundScheduler.getConfig();
      setConfig(cfg);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const history = await backgroundScheduler.getTaskHistory();
      setTaskHistory(history.slice(-10));
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const toggleScheduler = async () => {
    if (config) {
      await backgroundScheduler.updateConfig({ enabled: !config.enabled });
      await loadConfig();
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = await backgroundScheduler.getTask(taskId);
    if (task) {
      await backgroundScheduler.updateTask(taskId, { enabled: !task.enabled });
      await loadConfig();
    }
  };

  const updateTaskTime = async (taskId: string, newTime: string) => {
    await backgroundScheduler.updateTask(taskId, { time: newTime });
    await loadConfig();
    setEditingTaskId(null);
  };

  const updateTaskMode = async (taskId: string, newMode: 'desktop' | 'mobile' | 'both') => {
    await backgroundScheduler.updateTask(taskId, { mode: newMode });
    await loadConfig();
  };

  if (!config) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Background Scheduler</Text>
          <Text className="mt-2 text-sm text-muted">
            Automate searches and activities at scheduled times
          </Text>
        </View>

        {/* Master Toggle */}
        <View className="mb-6 flex-row items-center justify-between rounded-lg bg-surface p-4">
          <View>
            <Text className="font-semibold text-foreground">Enable Scheduler</Text>
            <Text className="mt-1 text-xs text-muted">
              {config.enabled ? '🟢 Active' : '🔴 Inactive'}
            </Text>
          </View>
          <Switch
            value={config.enabled}
            onValueChange={toggleScheduler}
            trackColor={{ false: '#ccc', true: colors.primary }}
          />
        </View>

        {/* Scheduled Tasks */}
        <View className="mb-6">
          <Text className="mb-3 text-sm font-semibold text-foreground">SCHEDULED TASKS</Text>
          <View className="gap-3">
            {config.tasks.map((task) => (
              <View key={task.id} className="rounded-lg bg-surface p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground capitalize">{task.id}</Text>
                    <Text className="mt-1 text-sm text-muted">{task.time}</Text>
                    {task.lastRun && (
                      <Text className="mt-1 text-xs text-muted">
                        Last run: {new Date(task.lastRun).toLocaleTimeString()}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={task.enabled}
                    onValueChange={() => toggleTask(task.id)}
                    trackColor={{ false: '#ccc', true: colors.primary }}
                  />
                </View>

                {/* Mode Selection */}
                <View className="mt-3 flex-row gap-2">
                  {(['desktop', 'mobile', 'both'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => updateTaskMode(task.id, mode)}
                      className={`flex-1 rounded-lg p-2 ${
                        task.mode === mode ? 'bg-primary/20' : 'bg-muted/10'
                      }`}
                    >
                      <Text
                        className={`text-center text-xs font-semibold ${
                          task.mode === mode ? 'text-primary' : 'text-muted'
                        }`}
                      >
                        {mode === 'desktop' ? '🖥️' : mode === 'mobile' ? '📱' : '🔄'} {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Task History */}
        <View className="mb-6 rounded-lg bg-surface p-4">
          <Text className="mb-3 text-sm font-semibold text-foreground">RECENT EXECUTIONS</Text>
          {taskHistory.length > 0 ? (
            <View className="gap-2">
              {taskHistory.map((entry, index) => (
                <View key={index} className="flex-row justify-between border-b border-border pb-2">
                  <View>
                    <Text className="text-xs font-semibold text-foreground capitalize">
                      {entry.taskId}
                    </Text>
                    <Text className="text-xs text-muted">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-success">✓ {entry.status}</Text>
                    <Text className="text-xs text-muted">{entry.mode}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-muted">No executions yet</Text>
          )}
        </View>

        {/* Info Card */}
        <View className="rounded-lg bg-primary/10 p-4">
          <Text className="text-xs font-semibold text-primary">💡 HOW IT WORKS</Text>
          <Text className="mt-2 text-sm text-foreground leading-relaxed">
            Scheduled tasks run automatically at the specified times. The app doesn't need to be open.
            Select desktop, mobile, or both modes for each task. Last run times are tracked for reference.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
