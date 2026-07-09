import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { useColors } from "@/hooks/use-colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  style?: any;
}

export function SkeletonCard({ lines = 3, style }: SkeletonCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          gap: 12,
          marginBottom: 16,
        },
        style,
      ]}
    >
      {/* Header skeleton */}
      <View style={{ gap: 8 }}>
        <SkeletonLoader width="60%" height={20} />
        <SkeletonLoader width="40%" height={16} />
      </View>

      {/* Content skeleton */}
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader key={i} width={i === lines - 1 ? "70%" : "100%"} height={12} />
      ))}

      {/* Button skeleton */}
      <SkeletonLoader width="100%" height={48} borderRadius={12} style={{ marginTop: 8 }} />
    </View>
  );
}

interface SkeletonStatsProps {
  count?: number;
}

export function SkeletonStats({ count = 3 }: SkeletonStatsProps) {
  const colors = useColors();

  return (
    <View style={{ gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonLoader width="50%" height={14} />
            <SkeletonLoader width="70%" height={24} />
          </View>
          <SkeletonLoader width={60} height={60} borderRadius={30} />
        </View>
      ))}
    </View>
  );
}

interface SkeletonChartProps {
  bars?: number;
}

export function SkeletonChart({ bars = 7 }: SkeletonChartProps) {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        gap: 16,
      }}
    >
      <SkeletonLoader width="40%" height={16} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: 150,
          gap: 8,
        }}
      >
        {Array.from({ length: bars }).map((_, i) => (
          <View key={i} style={{ flex: 1, gap: 8, alignItems: "center" }}>
            <SkeletonLoader width="100%" height={Math.random() * 100 + 50} borderRadius={4} />
            <SkeletonLoader width="100%" height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}
