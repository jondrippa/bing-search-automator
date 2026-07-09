import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { achievementSystem, type AchievementCategory } from '@/lib/achievements';
import { useColors } from '@/hooks/use-colors';

export default function AchievementsScreen() {
  const colors = useColors();
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const cats = await achievementSystem.getAchievementsByCategory();
      const completion = await achievementSystem.getCompletionPercentage();
      setCategories(cats);
      setCompletionPercentage(completion);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Achievements</Text>
          <Text className="mt-2 text-sm text-muted">Unlock badges and earn rewards</Text>
        </View>

        {/* Completion Progress */}
        <View className="mb-6 rounded-lg bg-primary/10 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-primary">COMPLETION</Text>
              <Text className="mt-2 text-3xl font-bold text-foreground">
                {completionPercentage}%
              </Text>
            </View>
            <View className="flex-1 items-center">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/20">
                <Text className="text-4xl font-bold text-primary">{completionPercentage}</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-4 h-2 overflow-hidden rounded-full bg-border">
            <View
              className="h-full bg-primary"
              style={{ width: `${completionPercentage}%` }}
            />
          </View>
        </View>

        {/* Achievement Categories */}
        <View className="gap-3">
          {categories.map((category) => (
            <View key={category.name}>
              <TouchableOpacity
                onPress={() =>
                  setExpandedCategory(
                    expandedCategory === category.name ? null : category.name
                  )
                }
                className="flex-row items-center justify-between rounded-lg bg-surface p-4"
              >
                <View>
                  <Text className="text-lg font-semibold text-foreground">
                    {category.name}
                  </Text>
                  <Text className="text-xs text-muted">
                    {category.completedCount} of {category.achievements.length} unlocked
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-primary">
                  {category.completedCount}/{category.achievements.length}
                </Text>
              </TouchableOpacity>

              {/* Expanded Category */}
              {expandedCategory === category.name && (
                <View className="mt-2 gap-2 rounded-lg bg-surface p-4">
                  {category.achievements.map((achievement) => (
                    <View
                      key={achievement.id}
                      className={`flex-row items-center gap-3 rounded-lg p-3 ${
                        achievement.unlockedAt
                          ? 'bg-primary/10'
                          : 'bg-muted/10 opacity-60'
                      }`}
                    >
                      <Text className="text-3xl">{achievement.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">
                          {achievement.name}
                        </Text>
                        <Text className="text-xs text-muted">
                          {achievement.description}
                        </Text>
                        {!achievement.unlockedAt && (
                          <View className="mt-1 flex-row items-center gap-1">
                            <View className="h-1 flex-1 rounded-full bg-border">
                              <View
                                className="h-full bg-primary"
                                style={{
                                  width: `${Math.min(
                                    (achievement.progress / achievement.requirement) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </View>
                            <Text className="text-xs text-muted">
                              {achievement.progress}/{achievement.requirement}
                            </Text>
                          </View>
                        )}
                      </View>
                      {achievement.unlockedAt && (
                        <Text className="text-lg">✓</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Motivational Message */}
        <View className="mt-6 rounded-lg bg-success/10 p-4">
          <Text className="text-xs font-semibold text-success">🎯 KEEP GOING!</Text>
          <Text className="mt-2 text-sm text-foreground leading-relaxed">
            You're making great progress! Complete more activities to unlock all achievements
            and become a Bing Rewards master.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
