import { ScrollView, Text, View, Pressable, FlatList, RefreshControl } from "react-native";
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

export default function OpportunitiesLiveScreen() {
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
      const pointsEarned = await completeOpportunity(id);
      const opportunity = opportunities.find((o) => o.id === id);
      // Update local state
      setOpportunities(opportunities.map((opp) =>
        opp.id === id ? { ...opp, isCompleted: true, pointsEarned } : opp
      ));
      if (opportunity) {
        setTotalPoints(totalPoints - opportunity.pointsAvailable);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete opportunity");
    }
  };

  const categories = [
    { id: "all", label: "All", icon: "📊" },
    { id: "quiz", label: "Quizzes", icon: "🧠" },
    { id: "survey", label: "Surveys", icon: "📋" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "xbox", label: "Xbox", icon: "🎮" },
    { id: "daily-task", label: "Daily", icon: "✨" },
    { id: "bonus", label: "Bonus", icon: "🎁" },
  ];

  const filteredOpportunities =
    selectedCategory === null || selectedCategory === "all"
      ? opportunities
      : opportunities.filter((opp) => opp.category === selectedCategory);

  const getCategoryColor = (category: RewardsActivity["category"]) => {
    switch (category) {
      case "quiz":
        return "#7C3AED";
      case "survey":
        return "#0891B2";
      case "shopping":
        return "#DC2626";
      case "xbox":
        return "#16A34A";
      case "daily-task":
        return "#F59E0B";
      case "bonus":
        return "#EC4899";
      case "trending":
        return "#F97316";
      default:
        return colors.primary;
    }
  };

  const renderOpportunityCard = ({ item }: { item: RewardsActivity }) => (
    <Pressable
      onPress={() => handleCompleteOpportunity(item.id)}
      disabled={item.isCompleted}
      style={({ pressed }) => ({
        opacity: pressed && !item.isCompleted ? 0.8 : 1,
        transform: [{ scale: pressed && !item.isCompleted ? 0.98 : 1 }],
      })}
    >
      <View
        className="rounded-xl p-4 mb-3 border"
        style={{
          backgroundColor: item.isCompleted ? colors.muted : colors.surface,
          borderColor: getCategoryColor(item.category),
          borderWidth: 1,
          opacity: item.isCompleted ? 0.5 : 1,
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 flex-row items-center gap-2">
            <Text className="text-2xl">{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-muted">
                {item.category.toUpperCase().replace("-", " ")}
              </Text>
              <Text className="text-sm font-bold text-foreground">{item.title}</Text>
            </View>
          </View>
        </View>

        <Text className="text-xs text-muted mb-3">{item.description}</Text>

        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-4">
            <View>
              <Text className="text-xs text-muted">Points</Text>
              <Text className="text-base font-bold text-foreground">
                +{item.pointsAvailable}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-muted">Time</Text>
              <Text className="text-base font-bold text-foreground">
                {item.timeToComplete}m
              </Text>
            </View>
          </View>

          {item.isCompleted ? (
            <View
              className="px-3 py-1 rounded-lg"
              style={{ backgroundColor: colors.success }}
            >
              <Text className="text-xs font-bold text-white">✓ Done</Text>
            </View>
          ) : (
            <View
              className="px-3 py-1 rounded-lg"
              style={{ backgroundColor: getCategoryColor(item.category) }}
            >
              <Text className="text-xs font-bold text-white">Start</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 gap-2">
              <Text className="text-3xl font-bold text-foreground">
                Opportunities
              </Text>
              <Text className="text-sm text-muted">
                Real-time earning activities
              </Text>
            </View>
            <Pressable
              onPress={handleRefresh}
              disabled={isRefreshing}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text className="text-2xl">{isRefreshing ? "⟳" : "🔄"}</Text>
            </Pressable>
          </View>

          {/* Error State */}
          {error && (
            <View
              className="rounded-xl p-4 gap-2"
              style={{
                backgroundColor: colors.error,
                opacity: 0.2,
              }}
            >
              <Text className="text-sm font-semibold text-error">Error</Text>
              <Text className="text-xs text-error">{error}</Text>
            </View>
          )}

          {/* Loading State */}
          {isLoading ? (
            <View className="items-center justify-center py-12 gap-3">
              <Text className="text-3xl">⟳</Text>
              <Text className="text-base font-semibold text-foreground">
                Loading opportunities...
              </Text>
            </View>
          ) : (
            <>
              {/* Summary Cards */}
              <View className="gap-3">
                <View
                  className="rounded-2xl p-4 flex-row justify-between items-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View>
                    <Text className="text-xs text-muted mb-1">Total Available</Text>
                    <Text className="text-2xl font-bold text-foreground">
                      {totalPoints}
                    </Text>
                  </View>
                  <Text className="text-3xl">💎</Text>
                </View>

                {expiringCount > 0 && (
                  <View
                    className="rounded-2xl p-4 flex-row justify-between items-center border"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.warning,
                      borderWidth: 1,
                    }}
                  >
                    <View>
                      <Text className="text-xs text-muted mb-1">Expiring Soon</Text>
                      <Text className="text-2xl font-bold text-warning">
                        {expiringCount}
                      </Text>
                    </View>
                    <Text className="text-3xl">⏰</Text>
                  </View>
                )}
              </View>

              {/* Category Filter */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-muted">Filter by</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() =>
                        setSelectedCategory(
                          selectedCategory === cat.id ? null : cat.id
                        )
                      }
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <View
                        className="px-4 py-2 rounded-full flex-row items-center gap-1"
                        style={{
                          backgroundColor:
                            selectedCategory === cat.id
                              ? colors.primary
                              : colors.surface,
                        }}
                      >
                        <Text className="text-sm">{cat.icon}</Text>
                        <Text
                          className="text-sm font-semibold"
                          style={{
                            color:
                              selectedCategory === cat.id
                                ? "#ffffff"
                                : colors.foreground,
                          }}
                        >
                          {cat.label}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Opportunities List */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-muted">
                  {filteredOpportunities.length} Available
                </Text>
                {filteredOpportunities.length > 0 ? (
                  <FlatList
                    data={filteredOpportunities}
                    renderItem={renderOpportunityCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                ) : (
                  <View className="items-center justify-center py-12 gap-3">
                    <Text className="text-3xl">🎉</Text>
                    <Text className="text-base font-semibold text-foreground">
                      All caught up!
                    </Text>
                    <Text className="text-sm text-muted text-center">
                      You've completed all available opportunities. Check back later for more!
                    </Text>
                  </View>
                )}
              </View>

              {/* Info Box */}
              <View
                className="rounded-2xl p-4 gap-2"
                style={{
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text className="text-sm font-semibold text-foreground">
                  💡 Live Data
                </Text>
                <Text className="text-sm text-muted leading-relaxed">
                  This screen fetches real-time opportunities from your Bing Rewards account. Pull down to refresh!
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
