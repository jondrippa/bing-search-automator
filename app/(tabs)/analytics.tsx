import { ScrollView, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { analyticsService, type AnalyticsMetrics, type TrendData } from '@/lib/analytics-service';
import { useColors } from '@/hooks/use-colors';

export default function AnalyticsScreen() {
  const colors = useColors();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [efficiencyAnalysis, setEfficiencyAnalysis] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const metricsData = await analyticsService.getMetrics();
      const trends = await analyticsService.getTrendData(30);
      const efficiency = await analyticsService.getEfficiencyAnalysis();
      setMetrics(metricsData);
      setTrendData(trends);
      setEfficiencyAnalysis(efficiency);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!metrics) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading analytics...</Text>
      </ScreenContainer>
    );
  }

  // Calculate bar chart heights for last 7 days
  const last7Days = trendData.slice(-7);
  const maxPoints = Math.max(...last7Days.map((d) => d.points), 1);
  const barHeights = last7Days.map((d) => (d.points / maxPoints) * 150);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Analytics</Text>
          <Text className="mt-2 text-sm text-muted">Your earning performance & trends</Text>
        </View>

        {/* Key Metrics Grid */}
        <View className="mb-6 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-lg bg-surface p-4">
              <Text className="text-xs font-semibold text-muted">TOTAL POINTS</Text>
              <Text className="mt-2 text-2xl font-bold text-primary">
                {metrics.totalPoints.toLocaleString()}
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-surface p-4">
              <Text className="text-xs font-semibold text-muted">TOTAL SEARCHES</Text>
              <Text className="mt-2 text-2xl font-bold text-primary">
                {metrics.totalSearches}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-lg bg-surface p-4">
              <Text className="text-xs font-semibold text-muted">AVG PER SEARCH</Text>
              <Text className="mt-2 text-2xl font-bold text-primary">
                {metrics.averagePointsPerSearch.toFixed(1)}
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-surface p-4">
              <Text className="text-xs font-semibold text-muted">AVG PER DAY</Text>
              <Text className="mt-2 text-2xl font-bold text-primary">
                {Math.round(metrics.averagePointsPerDay)}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-lg bg-surface p-4">
              <Text className="text-xs font-semibold text-muted">ACTIVITIES</Text>
              <Text className="mt-2 text-2xl font-bold text-primary">
                {metrics.totalActivities}
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-success/10 p-4">
              <Text className="text-xs font-semibold text-success">STREAK</Text>
              <Text className="mt-2 text-2xl font-bold text-success">{metrics.streakDays}d</Text>
            </View>
          </View>
        </View>

        {/* Points Bar Chart */}
        {last7Days.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">Points Trend (7d)</Text>
            <View className="rounded-lg bg-surface p-4">
              <View className="flex-row items-end justify-between gap-1" style={{ height: 180 }}>
                {last7Days.map((day, idx) => (
                  <View key={idx} className="flex-1 items-center gap-2">
                    <View
                      className="w-full rounded-t bg-primary"
                      style={{
                        height: barHeights[idx],
                        minHeight: 4,
                      }}
                    />
                    <Text className="text-xs text-muted">{day.date.split('-')[2]}</Text>
                  </View>
                ))}
              </View>
              <View className="mt-4 border-t border-border pt-2">
                <Text className="text-xs text-muted">
                  Max: {Math.max(...last7Days.map((d) => d.points))} pts
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Efficiency Analysis */}
        {efficiencyAnalysis && (
          <View className="mb-6 gap-3">
            <Text className="text-lg font-semibold text-foreground">Efficiency Analysis</Text>

            <View className="rounded-lg bg-surface p-4">
              <Text className="text-xs font-semibold text-muted">AVERAGE EFFICIENCY</Text>
              <Text className="mt-2 text-2xl font-bold text-primary">
                {efficiencyAnalysis.averageEfficiency.toFixed(2)}
              </Text>
              <Text className="mt-1 text-xs text-muted">points per search</Text>
            </View>

            <View className="rounded-lg bg-success/10 p-4">
              <Text className="text-xs font-semibold text-success">📈 TREND</Text>
              <Text className="mt-2 text-lg font-bold text-success">
                {efficiencyAnalysis.trend === 'improving'
                  ? '↗️ Improving'
                  : efficiencyAnalysis.trend === 'declining'
                    ? '↘️ Declining'
                    : '→ Stable'}
              </Text>
            </View>

            {efficiencyAnalysis.bestEfficiencyDay && (
              <View className="rounded-lg bg-primary/10 p-4">
                <Text className="text-xs font-semibold text-primary">🏆 BEST EFFICIENCY</Text>
                <Text className="mt-2 text-lg font-bold text-foreground">
                  {efficiencyAnalysis.bestEfficiencyDay.date}
                </Text>
                <Text className="text-sm text-muted">
                  {efficiencyAnalysis.bestEfficiencyDay.efficiency.toFixed(2)} pts/search
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Best & Worst Days */}
        <View className="mb-6 gap-3">
          {metrics.bestDay && (
            <View className="rounded-lg bg-success/10 p-4">
              <Text className="text-xs font-semibold text-success">🏆 BEST DAY</Text>
              <Text className="mt-2 text-lg font-bold text-foreground">
                {metrics.bestDay.date}
              </Text>
              <Text className="text-sm text-muted">
                {metrics.bestDay.pointsEarned} points • {metrics.bestDay.searchesCompleted}{' '}
                searches
              </Text>
            </View>
          )}

          {metrics.worstDay && (
            <View className="rounded-lg bg-warning/10 p-4">
              <Text className="text-xs font-semibold text-warning">📉 LOWEST DAY</Text>
              <Text className="mt-2 text-lg font-bold text-foreground">
                {metrics.worstDay.date}
              </Text>
              <Text className="text-sm text-muted">
                {metrics.worstDay.pointsEarned} points • {metrics.worstDay.searchesCompleted}{' '}
                searches
              </Text>
            </View>
          )}
        </View>

        {/* Insights */}
        <View className="rounded-lg bg-primary/10 p-4">
          <Text className="text-xs font-semibold text-primary">💡 INSIGHTS</Text>
          <Text className="mt-2 text-sm text-foreground leading-relaxed">
            You've earned an average of {Math.round(metrics.averagePointsPerDay)} points per day
            with {metrics.averagePointsPerSearch.toFixed(1)} points per search. Keep up the
            consistent activity to maintain your streak!
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
