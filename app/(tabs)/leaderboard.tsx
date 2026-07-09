import { ScrollView, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { leaderboardService, type LeaderboardEntry } from '@/lib/leaderboard-service';
import { useColors } from '@/hooks/use-colors';

export default function LeaderboardScreen() {
  const colors = useColors();
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [userContext, setUserContext] = useState<LeaderboardEntry[]>([]);
  const [userPercentile, setUserPercentile] = useState(0);
  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const top = await leaderboardService.getTopUsers(10);
      const context = await leaderboardService.getUserRankWithContext(3);
      const percentile = await leaderboardService.getUserPercentile();
      const leaderboard = await leaderboardService.getLeaderboard();

      setTopUsers(top);
      setUserContext(context);
      setUserPercentile(percentile);
      setUserRank(leaderboard.currentUserRank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getRankMedal = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Leaderboard</Text>
          <Text className="mt-2 text-sm text-muted">Compete with other users</Text>
        </View>

        {/* Your Rank Card */}
        <View className="mb-6 rounded-lg bg-primary/10 p-4">
          <Text className="text-xs font-semibold text-primary">YOUR RANKING</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text className="text-4xl font-bold text-foreground">#{userRank}</Text>
              <Text className="mt-1 text-sm text-muted">
                Top {userPercentile}% of users
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-5xl">{userPercentile > 50 ? '🚀' : '📈'}</Text>
              <Text className="mt-2 text-xs text-muted">{userPercentile}th percentile</Text>
            </View>
          </View>
        </View>

        {/* Top 10 Leaderboard */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-foreground">Top 10</Text>
          <View className="gap-2 rounded-lg bg-surface p-3">
            {topUsers.map((user) => (
              <View
                key={user.userId}
                className={`flex-row items-center justify-between rounded-lg p-3 ${
                  user.isCurrentUser ? 'bg-primary/20' : 'bg-muted/10'
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Text className="text-2xl font-bold text-primary w-8 text-center">
                    {getRankMedal(user.rank) || `#${user.rank}`}
                  </Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">
                      {user.username}
                      {user.isCurrentUser && ' (You)'}
                    </Text>
                    <Text className="text-xs text-muted">
                      {user.totalSearches} searches • {user.streakDays}d streak
                    </Text>
                  </View>
                </View>
                <Text className="text-lg font-bold text-primary">
                  {user.totalPoints.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Your Position Context */}
        {userContext.length > 0 && (
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">
              Around Your Rank
            </Text>
            <View className="gap-2 rounded-lg bg-surface p-3">
              {userContext.map((user) => (
                <View
                  key={user.userId}
                  className={`flex-row items-center justify-between rounded-lg p-3 ${
                    user.isCurrentUser ? 'bg-primary/20 border-2 border-primary' : 'bg-muted/10'
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="w-8 text-center font-bold text-foreground">
                      #{user.rank}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">
                        {user.username}
                        {user.isCurrentUser && ' (You)'}
                      </Text>
                      <Text className="text-xs text-muted">
                        {user.totalSearches} searches • {user.streakDays}d streak
                      </Text>
                    </View>
                  </View>
                  <Text className="text-lg font-bold text-primary">
                    {user.totalPoints.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Leaderboard Info */}
        <View className="rounded-lg bg-primary/10 p-4">
          <Text className="text-xs font-semibold text-primary">💡 HOW IT WORKS</Text>
          <Text className="mt-2 text-sm text-foreground leading-relaxed">
            Rankings are based on total points earned. Users are ranked by points (primary),
            then searches completed (secondary), then current streak (tertiary). Update your stats
            regularly to climb the leaderboard!
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
