import { ScrollView, Text, View, TouchableOpacity } from "react-native";

import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { AccountHealthCard } from "@/components/account-health-card";

interface SearchState {
  isSearching: boolean;
  currentMode: "desktop" | "mobile";
  searchCount: { desktop: number; mobile: number };
  pointsEarned: { desktop: number; mobile: number };
  tier: "member" | "silver" | "gold" | "legacy";
}

const TIER_LIMITS = {
  desktop: { member: 3, silver: 6, gold: 12, legacy: 30 },
  mobile: { member: 2, silver: 4, gold: 20, legacy: 20 }
};

export default function HomeScreen() {
  const colors = useColors();
  const [state, setState] = useState<SearchState>({
    isSearching: false,
    currentMode: "desktop",
    searchCount: { desktop: 0, mobile: 0 },
    pointsEarned: { desktop: 0, mobile: 0 },
    tier: "gold",
  });

  const [logs, setLogs] = useState<string[]>([]);

  const maxSearches = TIER_LIMITS[state.currentMode][state.tier];
  const currentCount = state.searchCount[state.currentMode];
  const currentPoints = state.pointsEarned[state.currentMode];

  // Add log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
  };

  // Start automatic search
  const handleStartAutomatic = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState(prev => ({ ...prev, isSearching: true, searchCount: { ...prev.searchCount, [prev.currentMode]: 0 } }));
    addLog(`Starting automatic ${state.currentMode} searches...`);
    simulateSearchProcess();
  };

  // Start single manual search
  const handleStartManual = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addLog(`Performing manual ${state.currentMode} search...`);
    // Simulate single search
    await new Promise(resolve => setTimeout(resolve, 2000));
    setState(prev => ({
      ...prev,
      searchCount: { ...prev.searchCount, [prev.currentMode]: prev.searchCount[prev.currentMode] + 1 },
      pointsEarned: { ...prev.pointsEarned, [prev.currentMode]: prev.pointsEarned[prev.currentMode] + 5 }
    }));
    addLog(`Manual search completed. +5 points`);
  };

  // Stop search
  const handleStop = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setState(prev => ({ ...prev, isSearching: false }));
    addLog("Search stopped by user");
  };

  // Simulate search process
  const simulateSearchProcess = async () => {
    const keywords = [
      "weather today",
      "news today",
      "best restaurants",
      "travel tips",
      "technology news",
      "sports scores",
      "stock market",
      "fitness tips",
      "recipe ideas",
      "movie reviews"
    ];

    for (let i = currentCount; i < maxSearches; i++) {
      if (!state.isSearching) break;

      const delay = Math.floor(Math.random() * 17000) + 15000; // 15-32 seconds
      await new Promise(resolve => setTimeout(resolve, delay));

      if (state.isSearching) {
        const keyword = keywords[Math.floor(Math.random() * keywords.length)];
        setState(prev => ({
          ...prev,
          searchCount: { ...prev.searchCount, [prev.currentMode]: prev.searchCount[prev.currentMode] + 1 },
          pointsEarned: { ...prev.pointsEarned, [prev.currentMode]: prev.pointsEarned[prev.currentMode] + 5 }
        }));
        addLog(`Searched: "${keyword}" (${i + 1}/${maxSearches})`);
      }
    }

    if (state.isSearching) {
      setState(prev => ({ ...prev, isSearching: false }));
      addLog("All searches completed!");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 p-8 gap-8">
          {/* Header */}
          <View className="items-center gap-3">
            <Text className="text-4xl font-bold text-foreground">Bing Rewards</Text>
            <Text className="text-lg text-muted">Automator</Text>
          </View>

          {/* Account Health Card */}
          <AccountHealthCard />

          {/* Status Card */}
          <View className="bg-surface rounded-2xl p-8 border border-border gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className={`w-4 h-4 rounded-full ${state.isSearching ? "bg-success" : "bg-muted"}`} />
                <Text className="text-base font-semibold text-foreground">
                  {state.isSearching ? "Searching..." : "Ready"}
                </Text>
              </View>
              <Text className="text-sm text-muted uppercase tracking-wider">{state.currentMode}</Text>
            </View>
            <Text className="text-base text-muted leading-relaxed">
              {state.isSearching
                ? `${currentCount}/${maxSearches} searches completed`
                : "Tap a button below to start earning points"}
            </Text>
          </View>

          {/* Counters */}
          <View className="flex-row gap-6">
            <View className="flex-1 bg-surface rounded-xl p-6 border border-border items-center gap-4">
              <Text className="text-base text-muted font-semibold uppercase">Points</Text>
              <Text className="text-4xl font-bold text-primary">{currentPoints}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-6 border border-border items-center gap-4">
              <Text className="text-base text-muted font-semibold uppercase">Searches</Text>
              <Text className="text-4xl font-bold text-primary">{currentCount}</Text>
              <Text className="text-base text-muted">of {maxSearches}</Text>
            </View>
          </View>

          {/* Mode Selector */}
          <View className="flex-row gap-4 bg-surface rounded-xl p-4 border border-border">
            {(["desktop", "mobile"] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setState(prev => ({ ...prev, currentMode: mode }))}
                className={`flex-1 py-4 rounded-lg items-center ${
                  state.currentMode === mode ? "bg-primary" : "bg-background"
                }`}
              >
                <Text className={`text-lg font-semibold ${state.currentMode === mode ? "text-background" : "text-foreground"}`}>
                  {mode === "desktop" ? "PC Search" : "Mobile Search"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Control Buttons */}
          <View className="gap-4">
            {!state.isSearching ? (
              <>
                <TouchableOpacity
                  onPress={handleStartAutomatic}
                  className="bg-primary rounded-lg py-6 items-center active:opacity-80"
                >
                  <Text className="text-xl font-semibold text-background">Start Automatic</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleStartManual}
                  className="bg-surface rounded-lg py-6 items-center border border-border active:opacity-80"
                >
                  <Text className="text-xl font-semibold text-foreground">Start Manual (1)</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleStop}
                className="bg-error rounded-lg py-6 items-center active:opacity-80"
              >
                <Text className="text-xl font-semibold text-background">Stop</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Activity Indicator */}
          {state.isSearching && (
            <View className="items-center gap-4">
              <Text className="text-base text-muted">Processing searches...</Text>
            </View>
          )}

          {/* Activity Log */}
          {logs.length > 0 && (
            <View className="bg-surface rounded-xl p-6 border border-border gap-3">
              <Text className="text-xl font-semibold text-foreground">Activity Log</Text>
              <ScrollView style={{ maxHeight: 250 }}>
                {logs.map((log, idx) => (
                  <Text key={idx} className="text-base text-muted font-mono mb-3">
                    {log}
                  </Text>
                ))}
              </ScrollView>
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
            <Text className="text-base font-semibold text-foreground">
              ⚠️ Anti-Detection Active
            </Text>
            <Text className="text-base text-muted leading-relaxed">
              This app uses randomized delays and localized searches to avoid account bans. Always use responsibly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
