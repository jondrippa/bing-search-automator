import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, Platform } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import type { EarningOpportunity } from '@/lib/opportunities-tracker';

interface OpportunityNotificationProps {
  opportunity: EarningOpportunity;
  onDismiss: () => void;
  onAction: () => void;
  autoHideDuration?: number;
}

export function OpportunityNotification({
  opportunity,
  onDismiss,
  onAction,
  autoHideDuration = 8000,
}: OpportunityNotificationProps) {
  const colors = useColors();
  const [visible, setVisible] = useState(true);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-hide timer
    const timer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss();
    });
  };

  if (!visible) return null;

  const getCategoryColor = (category: EarningOpportunity['category']) => {
    switch (category) {
      case 'quiz':
        return '#7C3AED'; // Purple
      case 'survey':
        return '#0891B2'; // Cyan
      case 'shopping':
        return '#DC2626'; // Red
      case 'xbox':
        return '#16A34A'; // Green
      case 'daily-task':
        return '#F59E0B'; // Amber
      case 'bonus':
        return '#EC4899'; // Pink
      case 'trending':
        return '#F97316'; // Orange
      default:
        return colors.primary;
    }
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 0],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        marginBottom: 16,
      }}
    >
      <View
        className="rounded-xl overflow-hidden shadow-lg mx-4"
        style={{
          backgroundColor: colors.surface,
          borderLeftWidth: 4,
          borderLeftColor: getCategoryColor(opportunity.category),
        }}
      >
        <View className="p-4 gap-3">
          {/* Header */}
          <View className="flex-row justify-between items-start gap-2">
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{opportunity.icon}</Text>
                <Text className="text-sm font-semibold text-muted">
                  {opportunity.category.toUpperCase().replace('-', ' ')}
                </Text>
                {opportunity.isNew && (
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: getCategoryColor(opportunity.category) }}
                  >
                    <Text className="text-xs font-bold text-white">NEW</Text>
                  </View>
                )}
              </View>
              <Text className="text-base font-bold text-foreground">
                {opportunity.title}
              </Text>
              <Text className="text-sm text-muted">{opportunity.description}</Text>
            </View>
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-xl text-muted">✕</Text>
            </Pressable>
          </View>

          {/* Details */}
          <View className="flex-row justify-between items-center gap-2 pt-2 border-t" style={{ borderTopColor: colors.border }}>
            <View className="flex-1 flex-row gap-4">
              <View className="gap-1">
                <Text className="text-xs text-muted">Points</Text>
                <Text className="text-lg font-bold text-foreground">
                  +{opportunity.pointsAvailable}
                </Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted">Time</Text>
                <Text className="text-lg font-bold text-foreground">
                  {opportunity.timeToComplete}m
                </Text>
              </View>
              {opportunity.expiresAt && (
                <View className="gap-1">
                  <Text className="text-xs text-muted">Expires</Text>
                  <Text className="text-sm font-semibold text-warning">
                    {getTimeRemaining(opportunity.expiresAt)}
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              onPress={onAction}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
                backgroundColor: getCategoryColor(opportunity.category),
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              })}
            >
              <Text className="text-sm font-bold text-white">Go</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function getTimeRemaining(expiresAt: string): string {
  const now = Date.now();
  const expiresAtTime = new Date(expiresAt).getTime();
  const diffMs = expiresAtTime - now;

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h left`;
  }
  return `${minutes}m left`;
}
