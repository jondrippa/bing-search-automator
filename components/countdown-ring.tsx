import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";

interface CountdownRingProps {
  remainingMs: number;
  totalMs: number;
  label: string;
  color?: string;
  size?: number;
}

export function CountdownRing({
  remainingMs,
  totalMs,
  label,
  color,
  size = 120,
}: CountdownRingProps) {
  const colors = useColors();
  const ringColor = color || colors.primary;

  // Calculate progress (0 to 1)
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));

  // Circle dimensions
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Format time display
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  // Determine color based on progress
  const getProgressColor = (): string => {
    if (progress > 0.7) return "#22C55E"; // Green - plenty of time
    if (progress > 0.3) return "#F59E0B"; // Orange - moderate time
    return "#EF4444"; // Red - low time
  };

  return (
    <View className="items-center gap-2">
      <View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={getProgressColor()} stopOpacity="1" />
              <Stop offset="100%" stopColor={getProgressColor()} stopOpacity="0.7" />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth="3"
            fill="none"
          />

          {/* Progress circle with rotation group */}
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getProgressColor()}
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>

        {/* Center text */}
        <View
          style={{
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: getProgressColor(),
              fontFamily: "monospace",
            }}
          >
            {formatTime(remainingMs)}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {label}
          </Text>
        </View>
      </View>

      {/* Progress percentage */}
      <Text
        style={{
          fontSize: 12,
          color: colors.muted,
          marginTop: 4,
        }}
      >
        {Math.round(progress * 100)}% Complete
      </Text>
    </View>
  );
}
