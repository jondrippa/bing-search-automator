import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";

interface SettingsState {
  tier: "member" | "silver" | "gold" | "legacy";
  minInterval: number;
  maxInterval: number;
  enableUserAgentRotation: boolean;
  enableLocalizedSearch: boolean;
  strictCooldown: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SettingsState>({
    tier: "gold",
    minInterval: 15,
    maxInterval: 32,
    enableUserAgentRotation: true,
    enableLocalizedSearch: true,
    strictCooldown: false,
  });

  const handleSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Save settings to AsyncStorage or backend
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSettings({
      tier: "gold",
      minInterval: 15,
      maxInterval: 32,
      enableUserAgentRotation: true,
      enableLocalizedSearch: true,
      strictCooldown: false,
    });
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted">Configure your automation</Text>
          </View>

          {/* Tier Selection */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">Rewards Tier</Text>
            {(["member", "silver", "gold", "legacy"] as const).map((tier) => (
              <TouchableOpacity
                key={tier}
                onPress={() => setSettings(prev => ({ ...prev, tier }))}
                className={`flex-row items-center gap-3 p-3 rounded-lg ${
                  settings.tier === tier ? "bg-primary/10" : "bg-background"
                }`}
              >
                <View className={`w-4 h-4 rounded-full border-2 ${
                  settings.tier === tier ? "border-primary bg-primary" : "border-border"
                }`} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground capitalize">{tier}</Text>
                  <Text className="text-xs text-muted">
                    {tier === "member" && "3 PC, 2 Mobile"}
                    {tier === "silver" && "6 PC, 4 Mobile"}
                    {tier === "gold" && "12 PC, 20 Mobile"}
                    {tier === "legacy" && "30 PC, 20 Mobile"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search Interval */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">Search Interval (seconds)</Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs text-muted mb-2">Min</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => setSettings(prev => ({ ...prev, minInterval: Math.max(5, prev.minInterval - 1) }))}
                    className="bg-primary rounded-lg p-2"
                  >
                    <Text className="text-background font-bold">−</Text>
                  </TouchableOpacity>
                  <Text className="flex-1 text-center text-lg font-bold text-foreground">{settings.minInterval}</Text>
                  <TouchableOpacity
                    onPress={() => setSettings(prev => ({ ...prev, minInterval: Math.min(60, prev.minInterval + 1) }))}
                    className="bg-primary rounded-lg p-2"
                  >
                    <Text className="text-background font-bold">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted mb-2">Max</Text>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => setSettings(prev => ({ ...prev, maxInterval: Math.max(5, prev.maxInterval - 1) }))}
                    className="bg-primary rounded-lg p-2"
                  >
                    <Text className="text-background font-bold">−</Text>
                  </TouchableOpacity>
                  <Text className="flex-1 text-center text-lg font-bold text-foreground">{settings.maxInterval}</Text>
                  <TouchableOpacity
                    onPress={() => setSettings(prev => ({ ...prev, maxInterval: Math.min(120, prev.maxInterval + 1) }))}
                    className="bg-primary rounded-lg p-2"
                  >
                    <Text className="text-background font-bold">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Anti-Detection Options */}
          <View className="bg-surface rounded-xl p-4 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground">Anti-Detection</Text>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Rotate User-Agent</Text>
              <Switch
                value={settings.enableUserAgentRotation}
                onValueChange={(value) => setSettings(prev => ({ ...prev, enableUserAgentRotation: value }))}
              />
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Use Localized Searches</Text>
              <Switch
                value={settings.enableLocalizedSearch}
                onValueChange={(value) => setSettings(prev => ({ ...prev, enableLocalizedSearch: value }))}
              />
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">15-min Cooldown (every 3)</Text>
              <Switch
                value={settings.strictCooldown}
                onValueChange={(value) => setSettings(prev => ({ ...prev, strictCooldown: value }))}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleSave}
              className="bg-primary rounded-lg py-4 items-center active:opacity-80"
            >
              <Text className="text-base font-semibold text-background">Save Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              className="bg-surface rounded-lg py-4 items-center border border-border active:opacity-80"
            >
              <Text className="text-base font-semibold text-foreground">Reset to Defaults</Text>
            </TouchableOpacity>
          </View>

          {/* Warning Banner */}
          <View className="bg-warning/10 rounded-lg p-4 border border-warning gap-2">
            <Text className="text-xs font-semibold text-warning">⚠️ Important</Text>
            <Text className="text-xs text-muted leading-relaxed">
              These settings are automatically optimized to avoid account bans. Modify with caution and always use responsibly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
