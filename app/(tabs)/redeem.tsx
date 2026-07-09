import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { redemptionCatalog, type RedemptionItem, type UserLocation } from '@/lib/redemption-catalog';
import { useColors } from '@/hooks/use-colors';

export default function RedeemScreen() {
  const colors = useColors();
  const [items, setItems] = useState<RedemptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [currentPoints] = useState(5000); // Mock current points
  const [dailyEarnings] = useState(300); // Mock daily earnings

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const location = await redemptionCatalog.getUserLocation();
      setUserLocation(location);

      const allItems = await redemptionCatalog.getRedemptionItems();
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'gaming', label: '🎮 Gaming', color: '#7c3aed' },
    { id: 'entertainment', label: '🎬 Entertainment', color: '#ec4899' },
    { id: 'shopping', label: '🛍️ Shopping', color: '#f59e0b' },
    { id: 'gift-card', label: '🎁 Gift Cards', color: '#06b6d4' },
  ];

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#22c55e';
    if (progress >= 75) return '#84cc16';
    if (progress >= 50) return '#f59e0b';
    if (progress >= 25) return '#f97316';
    return '#ef4444';
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-foreground">Loading rewards...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Redeem Rewards</Text>
          <Text className="mt-2 text-sm text-muted">
            {userLocation?.city}, {userLocation?.countryCode}
          </Text>
        </View>

        {/* Current Points */}
        <View className="mb-6 rounded-lg bg-primary p-4">
          <Text className="text-sm text-white opacity-80">Your Points</Text>
          <Text className="mt-1 text-4xl font-bold text-white">{currentPoints.toLocaleString()}</Text>
          <Text className="mt-2 text-xs text-white opacity-70">
            Earning ~{dailyEarnings} points/day
          </Text>
        </View>

        {/* Category Filter */}
        <View className="mb-6">
          <Text className="mb-3 text-sm font-semibold text-foreground">Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-2 ${
                selectedCategory === null ? 'bg-primary' : 'bg-surface border border-border'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedCategory === null ? 'text-white' : 'text-foreground'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 ${
                  selectedCategory === cat.id ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === cat.id ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Redemption Items */}
        <View className="gap-4">
          {filteredItems.map((item) => {
            const progress = redemptionCatalog.calculateProgress(currentPoints, item.basePoints);
            const pointsNeeded = redemptionCatalog.calculatePointsNeeded(
              currentPoints,
              item.basePoints
            );
            const daysNeeded = redemptionCatalog.estimateDaysToRedemption(
              currentPoints,
              item.basePoints,
              dailyEarnings
            );
            const progressColor = getProgressColor(progress);

            return (
              <View
                key={item.id}
                className="rounded-lg border border-border bg-surface p-4"
              >
                {/* Item Header */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-2xl">{item.icon}</Text>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {item.name}
                        </Text>
                        <Text className="text-xs text-muted">{item.description}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-primary">
                      ${item.value}
                    </Text>
                    <Text className="text-xs text-muted">
                      {item.basePoints.toLocaleString()} pts
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="mt-4">
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-foreground">
                      {Math.round(progress)}% Complete
                    </Text>
                    {progress >= 100 ? (
                      <Text className="text-xs font-bold text-green-500">Ready to Redeem!</Text>
                    ) : (
                      <Text className="text-xs text-muted">
                        {pointsNeeded.toLocaleString()} pts needed
                      </Text>
                    )}
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-border">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </View>
                </View>

                {/* Estimate */}
                <View className="mt-3">
                  {daysNeeded === Infinity ? (
                    <Text className="text-xs text-muted">
                      Earning rate not set - enable automation to estimate
                    </Text>
                  ) : (
                    <Text className="text-xs text-muted">
                      ~{Math.ceil(daysNeeded)} days at current earning rate
                    </Text>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  disabled={progress < 100}
                  className={`mt-4 rounded-lg py-2 ${
                    progress >= 100
                      ? 'bg-green-500'
                      : 'bg-border opacity-50'
                  }`}
                >
                  <Text className={`text-center font-semibold ${
                    progress >= 100 ? 'text-white' : 'text-muted'
                  }`}>
                    {progress >= 100 ? 'Redeem Now' : 'Locked'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
