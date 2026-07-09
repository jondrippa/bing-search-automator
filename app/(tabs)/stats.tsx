import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { SkeletonStats, SkeletonChart } from "@/components/skeleton-loader";
import { ErrorState } from "@/components/error-state";

interface DailyStats {
  date: string;
  searches: number;
  points: number;
}

interface HealthMetric {
  label: string;
  value: string;
  status: "good" | "warning" | "critical";
  icon: string;
}

export default function StatsScreen() {
  const colors = useColors();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalSearches, setTotalSearches] = useState(0);
  const [averagePointsPerSearch, setAveragePointsPerSearch] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real metrics from API
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = trpc.metrics.getMetrics.useQuery();
  const { data: statsData, isLoading: statsLoading, error: statsError } = trpc.metrics.getDailyStats.useQuery(
    {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    { enabled: !!metrics }
  );

  useEffect(() => {
    if (metrics && statsData) {
      // Transform database stats to display format
      const formattedStats: DailyStats[] = statsData.map((stat: any) => ({
        date: new Date(stat.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        searches: stat.searches,
        points: stat.points,
      }));

      setDailyStats(formattedStats);
      setTotalPoints(metrics.totalPoints);
      setTotalSearches(metrics.totalSearches);
      setAveragePointsPerSearch(
        metrics.totalSearches > 0 ? Math.round(metrics.totalPoints / metrics.totalSearches) : 0
      );
      setLoading(false);
    }
  }, [metrics, statsData]);

  useEffect(() => {
    // Set health metrics based on real data
    if (metrics) {
      setHealthMetrics([
        {
          label: "Account Status",
          value: "Active",
          status: "good",
          icon: "✓",
        },
        {
          label: "Daily Quota",
          value: `${metrics.dailySearches}/${metrics.dailyQuota}`,
          status: metrics.dailySearches >= metrics.dailyQuota ? "warning" : "good",
          icon: metrics.dailySearches >= metrics.dailyQuota ? "⚠" : "✓",
        },
        {
          label: "Total Points",
          value: metrics.totalPoints.toString(),
          status: "good",
          icon: "💰",
        },
        {
          label: "Total Searches",
          value: metrics.totalSearches.toString(),
          status: "good",
          icon: "🔍",
        },
      ]);
    }
  }, [metrics]);

  const getStatusColor = (status: "good" | "warning" | "critical") => {
    switch (status) {
      case "good":
        return colors.success;
      case "warning":
        return colors.warning;
      case "critical":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const maxSearches = Math.max(...dailyStats.map((d) => d.searches), 1);
  const maxPoints = Math.max(...dailyStats.map((d) => d.points), 1);

  const isLoading = metricsLoading || statsLoading;
  const hasError = metricsError || statsError;

  if (hasError) {
    return (
      <ScreenContainer className="bg-background">
        <ErrorState
          title="Failed to load statistics"
          message="We couldn't fetch your statistics. Please check your connection and try again."
          icon="❌"
          onRetry={() => window.location.reload()}
        />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="p-8 gap-10">
            <View className="gap-3">
              <Text className="text-5xl font-bold text-foreground">Statistics</Text>
              <Text className="text-xl text-muted">Last 7 days overview</Text>
            </View>
            <SkeletonStats count={3} />
            <View className="gap-4">
              <Text className="text-2xl font-semibold text-foreground">Daily Activity</Text>
              <SkeletonChart bars={7} />
            </View>
            <View className="gap-4">
              <Text className="text-2xl font-semibold text-foreground">Points Trend</Text>
              <SkeletonChart bars={7} />
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-8 gap-10">
          {/* Header */}
          <View className="gap-3">
            <Text className="text-5xl font-bold text-foreground">Statistics</Text>
            <Text className="text-xl text-muted">Last 7 days overview</Text>
          </View>

          {/* Summary Cards */}
          <View className="gap-4">
            <View
              className="rounded-2xl p-8 flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-base text-muted mb-3">Total Points</Text>
                <Text className="text-5xl font-bold text-foreground">
                  {totalPoints}
                </Text>
              </View>
              <Text className="text-6xl">💰</Text>
            </View>

            <View
              className="rounded-2xl p-8 flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-base text-muted mb-3">Total Searches</Text>
                <Text className="text-5xl font-bold text-foreground">
                  {totalSearches}
                </Text>
              </View>
              <Text className="text-6xl">🔍</Text>
            </View>

            <View
              className="rounded-2xl p-8 flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-base text-muted mb-3">Avg Points/Search</Text>
                <Text className="text-5xl font-bold text-foreground">
                  {averagePointsPerSearch}
                </Text>
              </View>
              <Text className="text-6xl">📊</Text>
            </View>
          </View>

          {/* Daily Activity Chart */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">
              Daily Search Activity
            </Text>
            <View
              className="rounded-2xl p-8"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-flex-end justify-between h-56 gap-4">
                {dailyStats.map((day, index) => (
                  <View key={index} className="flex-1 items-center gap-4">
                    <View
                      className="w-full rounded-t-lg"
                      style={{
                        height: (day.searches / maxSearches) * 180,
                        backgroundColor: colors.primary,
                      }}
                    />
                    <Text className="text-base text-muted">{day.date}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-base text-muted mt-5">Searches per day</Text>
            </View>
          </View>

          {/* Points Trend Chart */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">
              Points Trend
            </Text>
            <View
              className="rounded-2xl p-8"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-flex-end justify-between h-56 gap-4">
                {dailyStats.map((day, index) => (
                  <View key={index} className="flex-1 items-center gap-4">
                    <View
                      className="w-full rounded-t-lg"
                      style={{
                        height: (day.points / maxPoints) * 180,
                        backgroundColor: colors.success,
                      }}
                    />
                    <Text className="text-base text-muted">{day.date}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-base text-muted mt-5">Points earned per day</Text>
            </View>
          </View>

          {/* Account Health Metrics */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">
              Account Health
            </Text>
            <View className="gap-4">
              {healthMetrics.map((metric, index) => (
                <View
                  key={index}
                  className="rounded-2xl p-8 flex-row justify-between items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-1">
                    <Text className="text-lg text-muted mb-3">{metric.label}</Text>
                    <Text className="text-xl font-semibold text-foreground">
                      {metric.value}
                    </Text>
                  </View>
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{ backgroundColor: getStatusColor(metric.status) }}
                  >
                    <Text className="text-white text-xl font-bold">{metric.icon}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Daily Breakdown Table */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">
              Daily Breakdown
            </Text>
            <View
              className="rounded-2xl overflow-hidden p-2"
              style={{ backgroundColor: colors.surface }}
            >
              {/* Table Header */}
              <View
                className="flex-row p-6 border-b"
                style={{ borderBottomColor: colors.border }}
              >
                <Text className="flex-1 text-lg font-semibold text-muted">Date</Text>
                <Text className="flex-1 text-lg font-semibold text-muted text-center">
                  Searches
                </Text>
                <Text className="flex-1 text-lg font-semibold text-muted text-right">
                  Points
                </Text>
              </View>

              {/* Table Rows */}
              {dailyStats.map((day, index) => (
                <View
                  key={index}
                  className="flex-row p-6 border-b"
                  style={{
                    borderBottomColor: colors.border,
                    backgroundColor:
                      index % 2 === 0 ? colors.background : colors.surface,
                  }}
                >
                  <Text className="flex-1 text-base text-foreground font-medium">
                    {day.date}
                  </Text>
                  <Text className="flex-1 text-base text-foreground text-center">
                    {day.searches}
                  </Text>
                  <Text className="flex-1 text-base text-foreground text-right font-semibold">
                    +{day.points}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Insights Section */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">Insights</Text>
            <View
              className="rounded-2xl p-8 gap-5"
              style={{ backgroundColor: colors.surface, borderLeftWidth: 8, borderLeftColor: colors.primary }}
            >
              <Text className="text-lg font-semibold text-foreground">
                📈 Performance Summary
              </Text>
              <Text className="text-lg text-muted leading-relaxed">
                You've earned {totalPoints} points from {totalSearches} searches over the last 7 days. Your average earning rate is {averagePointsPerSearch} points per search. Keep up the consistent activity to maximize rewards!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
