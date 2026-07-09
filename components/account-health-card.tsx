import { View, Text, Pressable, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { accountHealthMonitor, type HealthFlag } from "@/lib/account-health-monitor";
import {
  generateRecoverySuggestion,
  getRemainingWaitTime,
  formatWaitTime,
  getMostCriticalSuggestion,
  type RecoverySuggestion,
} from "@/lib/recovery-suggestions";
import { CountdownProgressBar } from "./countdown-progress-bar";

export function AccountHealthCard() {
  const colors = useColors();
  const [health, setHealth] = useState(accountHealthMonitor.getHealth());
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<RecoverySuggestion[]>([]);
  const [mostCritical, setMostCritical] = useState<RecoverySuggestion | null>(null);
  const [countdownTime, setCountdownTime] = useState<string>("");
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentHealth = accountHealthMonitor.getHealth();
      setHealth(currentHealth);

      // Generate recovery suggestions for active flags
      const activeFlags = currentHealth.flags.filter((f) => !f.resolved);
      const newSuggestions = activeFlags.map((flag) =>
        generateRecoverySuggestion(flag.type as any, flag.timestamp)
      );
      setSuggestions(newSuggestions);

      // Get most critical suggestion
      const critical = getMostCriticalSuggestion(newSuggestions);
      setMostCritical(critical);

      // Update countdown
      if (critical) {
        const remaining = getRemainingWaitTime(critical.canResumeAt);
        setRemainingMs(remaining);
        setCountdownTime(formatWaitTime(remaining));
      }
    }, 1000); // Update every second for countdown

    return () => clearInterval(interval);
  }, []);

  const statusIcon = accountHealthMonitor.getStatusIcon();
  const statusColor = accountHealthMonitor.getStatusColor();
  const activeFlags = accountHealthMonitor.getActiveFlags();
  const criticalFlags = accountHealthMonitor.getCriticalFlags();

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "low":
        return "#3B82F6";
      case "medium":
        return "#F59E0B";
      case "high":
        return "#EF4444";
      case "critical":
        return "#DC2626";
      default:
        return colors.muted;
    }
  };

  const renderFlagIcon = (type: string): string => {
    switch (type) {
      case "captcha":
        return "🤖";
      case "unusual_activity":
        return "⚠️";
      case "rate_limit":
        return "⏱️";
      case "restriction":
        return "🚫";
      case "suspension_risk":
        return "⛔";
      default:
        return "❓";
    }
  };

  return (
    <View className="gap-3">
      {/* Main Health Card */}
      <Pressable
        onPress={() => setShowDetails(!showDetails)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <View
          className="rounded-2xl p-4 gap-3"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: statusColor,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl">{statusIcon}</Text>
              <View>
                <Text className="text-xs font-semibold text-muted">Account Health</Text>
                <Text className="text-sm font-bold text-foreground capitalize">
                  {health.status}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold" style={{ color: statusColor }}>
                {health.score}%
              </Text>
              <Text className="text-xs text-muted">Score</Text>
            </View>
          </View>

          {/* Health Bar */}
          <View
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.border }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${health.score}%`,
                backgroundColor: statusColor,
              }}
            />
          </View>

          {/* Status Info */}
          <View className="flex-row justify-between items-center pt-2 border-t" style={{ borderTopColor: colors.border }}>
            <View>
              <Text className="text-xs text-muted">Active Issues</Text>
              <Text className="text-base font-bold text-foreground">{activeFlags.length}</Text>
            </View>
            {health.automationPaused && (
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: colors.error }}
              >
                <Text className="text-xs font-bold text-white">⏸ Paused</Text>
              </View>
            )}
            <Text className="text-xs text-muted">
              Last checked: {new Date(health.lastChecked).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Critical Alerts */}
      {criticalFlags.length > 0 && (
        <View
          className="rounded-xl p-3 gap-2"
          style={{
            backgroundColor: colors.error,
            opacity: 0.15,
          }}
        >
          <Text className="text-sm font-bold text-error">🚨 Critical Issues</Text>
          {criticalFlags.map((flag) => (
            <Text key={flag.id} className="text-xs text-error">
              • {flag.title}
            </Text>
          ))}
        </View>
      )}

      {/* Recovery Suggestion with Progress Bar */}
      {mostCritical && (
        <View
          className="rounded-2xl p-4 gap-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: getSeverityColor(mostCritical.priority),
          }}
        >
          {/* Recovery Header */}
          <View className="flex-row items-start gap-2">
            <Text className="text-2xl">{mostCritical.icon}</Text>
            <View className="flex-1">
              <Text className="text-sm font-bold text-foreground">
                {mostCritical.title}
              </Text>
              <Text className="text-xs text-muted mt-1">
                {mostCritical.description}
              </Text>
            </View>
          </View>

          {/* Countdown Progress Bar */}
          <CountdownProgressBar
            remainingMs={remainingMs}
            totalMs={mostCritical.waitTimeMs}
            label="Safe to Resume In"
            showPercentage={true}
          />

          {/* Resume Time Info */}
          <View
            className="rounded-lg p-3 items-center gap-1"
            style={{
              backgroundColor: getSeverityColor(mostCritical.priority),
              opacity: 0.15,
            }}
          >
            <Text className="text-xs text-muted">Estimated Resume Time</Text>
            <Text className="text-sm font-semibold text-foreground">
              {new Date(mostCritical.canResumeAt).toLocaleString()}
            </Text>
          </View>

          {/* Actions */}
          <View className="gap-2">
            <Text className="text-xs font-semibold text-foreground">Recommended Actions:</Text>
            {mostCritical.actions.map((action, idx) => (
              <View key={idx} className="flex-row gap-2">
                <Text className="text-xs text-muted">•</Text>
                <Text className="text-xs text-muted flex-1">{action}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Detailed Flags (when expanded) */}
      {showDetails && activeFlags.length > 0 && (
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Active Issues</Text>
          <ScrollView
            contentContainerStyle={{ gap: 8 }}
            scrollEnabled={false}
          >
            {activeFlags.map((flag) => (
              <View
                key={flag.id}
                className="rounded-lg p-3 gap-2"
                style={{
                  backgroundColor: colors.surface,
                  borderLeftWidth: 3,
                  borderLeftColor: getSeverityColor(flag.severity),
                }}
              >
                <View className="flex-row items-start gap-2">
                  <Text className="text-lg">{renderFlagIcon(flag.type)}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground">
                      {flag.title}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {flag.description}
                    </Text>
                  </View>
                </View>

                <View
                  className="p-2 rounded bg-opacity-10"
                  style={{
                    backgroundColor: getSeverityColor(flag.severity),
                  }}
                >
                  <Text className="text-xs font-semibold text-foreground">
                    💡 {flag.recommendation}
                  </Text>
                </View>

                <Text className="text-xs text-muted">
                  {new Date(flag.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* No Issues State */}
      {activeFlags.length === 0 && (
        <View
          className="rounded-xl p-3 items-center gap-1"
          style={{
            backgroundColor: colors.success,
            opacity: 0.15,
          }}
        >
          <Text className="text-sm font-bold text-success">✅ All Clear</Text>
          <Text className="text-xs text-success">No issues detected. Safe to automate.</Text>
        </View>
      )}
    </View>
  );
}
