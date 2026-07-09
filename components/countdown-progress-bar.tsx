import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface CountdownProgressBarProps {
  remainingMs: number;
  totalMs: number;
  label: string;
  showPercentage?: boolean;
  height?: number;
}

export function CountdownProgressBar({
  remainingMs,
  totalMs,
  label,
  showPercentage = true,
  height = 8,
}: CountdownProgressBarProps) {
  const colors = useColors();

  // Calculate progress (0 to 1)
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const percentage = Math.round(progress * 100);

  // Format time display
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
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
    <View className="gap-2">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text
          className="text-sm font-bold font-mono"
          style={{ color: getProgressColor() }}
        >
          {formatTime(remainingMs)}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        className="rounded-full overflow-hidden"
        style={{
          height,
          backgroundColor: colors.border,
        }}
      >
        <View
          className="rounded-full"
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: getProgressColor(),
          }}
        />
      </View>

      {/* Percentage text */}
      {showPercentage && (
        <Text className="text-xs text-muted text-center">
          {percentage}% Complete
        </Text>
      )}
    </View>
  );
}
