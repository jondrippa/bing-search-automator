import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect, useCallback } from "react";
import {
  fetchLiveOpportunities,
  getHighPriorityOpportunities,
  getTotalAvailablePoints,
  getExpiringOpportunities,
  completeOpportunity,
  refreshOpportunities,
  type RewardsActivity,
} from "@/lib/opportunities-tracker-live";

export default function OpportunitiesScreen() {
  const colors = useColors();
  const [opportunities, setOpportunities] = useState<RewardsActivity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load opportunities on mount
  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [opps, total, expiring] = await Promise.all([
        fetchLiveOpportunities(),
        getTotalAvailablePoints(),
        getExpiringOpportunities(),
      ]);

      setOpportunities(opps);
      setTotalPoints(total);
      setExpiringCount(expiring.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
      console.error("Error loading opportunities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const opps = await refreshOpportunities();
      setOpportunities(opps);
      setTotalPoints(await getTotalAvailablePoints());
      setExpiringCount((await getExpiringOpportunities()).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh opportunities");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleCompleteOpportunity = async (id: string) => {
    try {
      await completeOpportunity(id);
      await handleRefresh();
    } catch (err) {
      console.error("Error completing opportunity:", err);
    }
  };

  const categories = [
    { id: "all", label: "All", icon: "📊" },
    { id: "quiz", label: "Quizzes", icon: "🧠" },
    { id: "survey", label: "Surveys", icon: "📋" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "xbox", label: "Xbox", icon: "🎮" },
  ];

  const filteredOpportunities = selectedCategory
    ? opportunities.filter((opp) => {
        if (selectedCategory === "all") return true;
        return opp.category === selectedCategory;
      })
    : opportunities;

  const getCategoryColor = (category?: string): string => {
    if (!category) return colors.muted;
    if (category === "quiz") return "#3B82F6";
    if (category === "survey") return "#8B5CF6";
    if (category === "shopping") return "#EC4899";
    if (category === "xbox") return "#10B981";
    return colors.primary;
  };

  const formatTimeRemaining = (expiresAt?: string): string => {
    if (!expiresAt) return "No expiration";
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff < 0) return "Expired";
    if (diff < 60000) return "< 1 min";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
    return `${Math.floor(diff / 86400000)} d`;
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View className="p-8 gap-10">
          {/* Header */}
          <View className="gap-3">
            <Text className="text-5xl font-bold text-foreground">Earning Opportunities</Text>
            <Text className="text-xl text-muted">
              Complete activities to earn points
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="flex-row gap-4">
            <View
              className="flex-1 rounded-xl p-8 gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base text-muted font-semibold">Available Points</Text>
              <Text className="text-5xl font-bold text-primary">
                {totalPoints.toLocaleString()}
              </Text>
            </View>
            <View
              className="flex-1 rounded-xl p-8 gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-base text-muted font-semibold">Expiring Soon</Text>
              <Text className="text-5xl font-bold text-warning">{expiringCount}</Text>
            </View>
          </View>

          {/* Category Filter */}
          <View className="gap-3">
            <Text className="text-xl font-semibold text-foreground">Filter by Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  >
                    <View
                      className="px-8 py-4 rounded-full"
                      style={{
                        backgroundColor:
                          selectedCategory === cat.id ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        className="text-lg font-semibold"
                        style={{
                          color:
                            selectedCategory === cat.id ? "white" : colors.foreground,
                        }}
                      >
                        {cat.icon} {cat.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Error State */}
          {error && (
            <View
              className="rounded-lg p-8 gap-4"
              style={{
                backgroundColor: colors.error,
                opacity: 0.15,
              }}
            >
              <Text className="text-xl font-semibold text-error">⚠️ Error</Text>
              <Text className="text-base text-error">{error}</Text>
            </View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View className="items-center py-12 gap-4">
              <Text className="text-5xl">⏳</Text>
              <Text className="text-xl text-muted">Loading opportunities...</Text>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && filteredOpportunities.length === 0 && (
            <View className="items-center py-12 gap-4">
              <Text className="text-5xl">📭</Text>
              <Text className="text-2xl font-semibold text-foreground">No opportunities</Text>
              <Text className="text-xl text-muted">
                Check back later for new activities
              </Text>
            </View>
          )}

          {/* Opportunities List */}
          {!isLoading && filteredOpportunities.length > 0 && (
            <View className="gap-6">
              {filteredOpportunities.map((opp) => (
                <View
                  key={opp.id}
                  className="rounded-xl p-8 gap-5"
                  style={{
                    backgroundColor: colors.surface,
                    borderLeftWidth: 6,
                    borderLeftColor: getCategoryColor(opp.category),
                  }}
                >
                  {/* Header */}
                  <View className="flex-row justify-between items-start gap-4">
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-foreground">
                        {opp.title}
                      </Text>
                      <Text className="text-base text-muted mt-3">
                        {opp.description}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-3xl font-bold text-primary">
                        {opp.pointsAvailable}
                      </Text>
                      <Text className="text-xl text-muted">pts</Text>
                    </View>
                  </View>

                  {/* Time Remaining */}
                  <View className="flex-row items-center gap-4 py-4 px-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                    <Text className="text-xl text-muted">⏱️</Text>
                    <Text className="text-xl text-muted">
                      {formatTimeRemaining(opp.expiresAt)}
                    </Text>
                  </View>

                  {/* Action Button */}
                  {!opp.isCompleted && (
                    <TouchableOpacity
                      onPress={() => handleCompleteOpportunity(opp.id)}
                      className="bg-primary rounded-lg py-5 items-center"
                    >
                      <Text className="text-xl font-semibold text-white">
                        Complete Activity
                      </Text>
                    </TouchableOpacity>
                  )}

                  {opp.isCompleted && (
                    <View className="bg-success rounded-lg py-5 items-center opacity-50">
                      <Text className="text-xl font-semibold text-white">✓ Completed</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
