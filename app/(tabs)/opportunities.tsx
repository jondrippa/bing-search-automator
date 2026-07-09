import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useCallback } from "react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { SkeletonCard, SkeletonStats } from "@/components/skeleton-loader";
import { ErrorState, EmptyState } from "@/components/error-state";

interface Opportunity {
  id: number;
  externalId: string;
  title: string;
  description?: string | null;
  category: string;
  pointsAvailable: number;
  pointsEarned?: number | null;
  isCompleted: boolean;
  expiresAt?: string | Date | null;
  url?: string | null;
  icon?: string | null;
  priority: string;
  userId: number;
  createdAt: Date;
  lastSynced: Date;
}

export default function OpportunitiesScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { opportunities, isLoading, error, markCompleted, getByCategory, getTotalPoints, getExpiringOpportunities } = useOpportunities();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refetch opportunities
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCompleteOpportunity = async (externalId: string, points: number) => {
    try {
      await markCompleted(externalId, points);
    } catch (err) {
      console.error("Error completing opportunity:", err);
    }
  };

  if (error) {
    return (
      <ScreenContainer className="bg-background">
        <ErrorState
          title="Failed to load opportunities"
          message="We couldn't fetch your opportunities. Please check your connection and try again."
          icon="❌"
          onRetry={handleRefresh}
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
              <Text className="text-5xl font-bold text-foreground">Earn</Text>
              <Text className="text-xl text-muted">Available opportunities</Text>
            </View>
            <SkeletonStats count={2} />
            <View className="gap-4">
              <Text className="text-2xl font-semibold text-foreground">Opportunities</Text>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} lines={2} />
              ))}
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  const categories = [
    { id: "all", label: "All", icon: "📊" },
    { id: "quiz", label: "Quizzes", icon: "🧠" },
    { id: "survey", label: "Surveys", icon: "📋" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "xbox", label: "Xbox", icon: "🎮" },
    { id: "search", label: "Search", icon: "🔍" },
  ];

  const filteredOpportunities = getByCategory(selectedCategory);
  const totalPoints = getTotalPoints();
  const expiringCount = getExpiringOpportunities().length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.error;
      case "medium":
        return colors.warning;
      case "low":
        return colors.success;
      default:
        return colors.muted;
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case "quiz":
        return "#E8F4F8";
      case "survey":
        return "#F0E8F8";
      case "shopping":
        return "#F8F0E8";
      case "xbox":
        return "#E8F0F8";
      case "search":
        return "#F8E8E8";
      default:
        return colors.surface;
    }
  };



  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View className="p-8 gap-10">
          {/* Header */}
          <View className="gap-3">
            <Text className="text-5xl font-bold text-foreground">Earn</Text>
            <Text className="text-xl text-muted">Available opportunities</Text>
          </View>

          {/* Summary Cards */}
          <View className="gap-4">
            <View
              className="rounded-2xl p-8 flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface }}
            >
              <View>
                <Text className="text-base text-muted mb-3">Total Available</Text>
                <Text className="text-5xl font-bold text-foreground">{totalPoints}</Text>
              </View>
              <Text className="text-6xl">💰</Text>
            </View>

            {expiringCount > 0 && (
              <View
                className="rounded-2xl p-8 flex-row justify-between items-center"
                style={{ backgroundColor: colors.surface, borderLeftWidth: 8, borderLeftColor: colors.warning }}
              >
                <View>
                  <Text className="text-base text-muted mb-3">Expiring Soon</Text>
                  <Text className="text-5xl font-bold text-foreground">{expiringCount}</Text>
                </View>
                <Text className="text-6xl">⏰</Text>
              </View>
            )}
          </View>

          {/* Category Filter */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">Filter by Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
              <View className="flex-row gap-3">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={{
                      backgroundColor: selectedCategory === cat.id ? colors.primary : colors.surface,
                      borderRadius: 20,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text className="text-xl">{cat.icon}</Text>
                    <Text
                      style={{
                        color: selectedCategory === cat.id ? colors.background : colors.foreground,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Opportunities List */}
          {filteredOpportunities.length === 0 ? (
            <EmptyState
              title="No Opportunities"
              message={
                selectedCategory === "all"
                  ? "Check back later for new opportunities"
                  : `No ${categories.find((c) => c.id === selectedCategory)?.label.toLowerCase()} available`
              }
              icon="📭"
            />
          ) : (
            <View className="gap-4">
              <Text className="text-2xl font-semibold text-foreground">
                Available ({filteredOpportunities.length})
              </Text>
              {filteredOpportunities.map((opp: Opportunity) => (
                <View
                  key={opp.externalId}
                  className="rounded-2xl p-8 gap-5"
                  style={{ backgroundColor: getCategoryBgColor(opp.category) }}
                >
                  <View className="flex-row justify-between items-start gap-4">
                    <View className="flex-1 gap-3">
                      <View className="flex-row items-center gap-3">
                        <Text className="text-3xl">{opp.icon || "⭐"}</Text>
                        <View className="flex-1">
                          <Text className="text-xl font-bold text-foreground" numberOfLines={2}>
                            {opp.title}
                          </Text>
                        </View>
                      </View>

                      {opp.description && (
                        <Text className="text-base text-muted leading-relaxed" numberOfLines={2}>
                          {opp.description}
                        </Text>
                      )}

                      <View className="flex-row items-center gap-4 flex-wrap">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-semibold text-foreground">
                            {opp.pointsAvailable} pts
                          </Text>
                        </View>

                        {opp.expiresAt && (
                          <View className="flex-row items-center gap-2">
                            <Text className="text-base text-muted">
                              Expires: {new Date(opp.expiresAt).toLocaleDateString()}
                            </Text>
                          </View>
                        )}

                        <View
                          className="px-4 py-2 rounded-full"
                          style={{ backgroundColor: getPriorityColor(opp.priority) }}
                        >
                          <Text className="text-white text-sm font-semibold capitalize">
                            {opp.priority}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {!opp.isCompleted && (
                    <TouchableOpacity
                      onPress={() => handleCompleteOpportunity(opp.externalId, opp.pointsAvailable)}
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: colors.background, fontSize: 16, fontWeight: "600" }}>
                        Complete & Earn {opp.pointsAvailable} pts
                      </Text>
                    </TouchableOpacity>
                  )}

                  {opp.isCompleted && (
                    <View
                      style={{
                        backgroundColor: colors.success,
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                        ✓ Completed - Earned {opp.pointsEarned || opp.pointsAvailable} pts
                      </Text>
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
