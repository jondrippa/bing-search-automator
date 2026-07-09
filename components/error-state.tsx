import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error. Please try again.",
  icon = "⚠️",
  onRetry,
  retryLabel = "Try Again",
}: ErrorStateProps) {
  const colors = useColors();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        gap: 24,
      }}
    >
      <Text style={{ fontSize: 64 }}>{icon}</Text>

      <View style={{ alignItems: "center", gap: 12 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: colors.foreground,
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.muted,
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 32,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: colors.background,
              fontSize: 16,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({
  title = "No data available",
  message = "There's nothing to show right now.",
  icon = "📭",
  action,
}: EmptyStateProps) {
  const colors = useColors();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        gap: 24,
      }}
    >
      <Text style={{ fontSize: 64 }}>{icon}</Text>

      <View style={{ alignItems: "center", gap: 12 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: colors.foreground,
            textAlign: "center",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.muted,
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          {message}
        </Text>
      </View>

      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 32,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: colors.background,
              fontSize: 16,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
