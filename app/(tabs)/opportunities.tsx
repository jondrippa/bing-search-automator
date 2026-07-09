import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import {
  getOpportunities,
  getHighPriorityOpportunities,
  getTotalAvailablePoints,
  getExpiringOpportunities,
  markOpportunityAsCompleted,
  type EarningOpportunity,
} from "@/lib/opportunities-tracker";

export default function OpportunitiesScreen() {
  const colors = useColors();
  const [opportunities, setOpportunities] = useState<EarningOpportunity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    const allOpps = getOpportunities();
    setOpportunities(allOpps);
    setTotalPoints(getTotalAvailablePoints());
    setExpiringCount(getExpiringOpportunities().length);
  }, []);

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

  const getCategoryColor = (category: EarningOpportunity["category"]) => {
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

  const handleCompleteOpportunity = (id: string) => {
    markOpportunityAsCompleted(id);
    setOpportunities(opportunities.map((opp) =>
      opp.id === id ? { ...opp, isCompleted: true } : opp
    ));
    setTotalPoints(getTotalAvailablePoints());
  };

  const renderOpportunityCard = ({ item }: { item: EarningOpportunity }) => (
    <Pressable
      onPress={() => handleCompleteOpportunity(item.id)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
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
              <Text className="text-sm font-bold text-foreground">
                {item.title}
              </Text>
            </View>
          </View>
          {item.isNew && (
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: getCategoryColor(item.category) }}
            >
              <Text className="text-xs font-bold text-white">NEW</Text>
            </View>
          )}
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
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Opportunities
            </Text>
            <Text className="text-sm text-muted">
              Earn extra points beyond searching
            </Text>
          </View>

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
            <FlatList
              data={filteredOpportunities}
              renderItem={renderOpportunityCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Empty State */}
          {filteredOpportunities.length === 0 && (
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
              💡 Pro Tip
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              Complete high-priority opportunities (marked with ⏰) first as they expire sooner. Mix activities to maximize your daily earnings!
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
