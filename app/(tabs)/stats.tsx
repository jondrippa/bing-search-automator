import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    // Generate mock data for the last 7 days
    const mockStats: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      mockStats.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        searches: Math.floor(Math.random() * 12) + 3,
        points: Math.floor(Math.random() * 150) + 30,
      });
    }
    
    setDailyStats(mockStats);

    // Calculate totals
    const total = mockStats.reduce((sum, day) => sum + day.points, 0);
    const searches = mockStats.reduce((sum, day) => sum + day.searches, 0);
    
    setTotalPoints(total);
    setTotalSearches(searches);
    setAveragePointsPerSearch(searches > 0 ? Math.round(total / searches) : 0);

    // Set health metrics
    setHealthMetrics([
      {
        label: "Account Status",
        value: "Active",
        status: "good",
        icon: "✓",
      },
      {
        label: "Detection Risk",
        value: "Low",
        status: "good",
        icon: "✓",
      },
      {
        label: "Daily Quota",
        value: "5/10",
        status: "good",
        icon: "✓",
      },
      {
        label: "Last Search",
        value: "2 min ago",
        status: "good",
        icon: "✓",
      },
    ]);
  }, []);

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
                You\\'ve earned {totalPoints} points from {totalSearches} searches over the last 7 days. Your average earning rate is {averagePointsPerSearch} points per search. Keep up the consistent activity to maximize rewards!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
