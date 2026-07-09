import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MicrosoftOAuthService } from "@/lib/microsoft-oauth";
import { ErrorState } from "@/components/error-state";

export default function ProfileScreen() {
  const colors = useColors();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [microsoftEmail, setMicrosoftEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    checkMicrosoftAuth();
  }, []);

  const checkMicrosoftAuth = async () => {
    try {
      const isAuth = await MicrosoftOAuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        const token = await MicrosoftOAuthService.getToken();
        if (token && typeof token === "object" && "email" in token) {
          setMicrosoftEmail((token as any).email);
        }
      }
    } catch (error) {
      console.error("Error checking Microsoft auth:", error);
    }
  };

  const handleConnectMicrosoft = async () => {
    try {
      setConnecting(true);
      const code = await MicrosoftOAuthService.startOAuthFlow();

      if (!code) {
        Alert.alert("Connection Cancelled", "You cancelled the Microsoft login.");
        setConnecting(false);
        return;
      }

      // Exchange code for token
      const tokenResponse = await MicrosoftOAuthService.exchangeCodeForToken(code);
      const userInfo = await MicrosoftOAuthService.getUserInfo(tokenResponse.access_token);

      // Save token
      await MicrosoftOAuthService.saveToken(tokenResponse, userInfo.mail);

      setIsAuthenticated(true);
      setMicrosoftEmail(userInfo.mail);

      Alert.alert("Success", `Connected to Microsoft account: ${userInfo.displayName}`);
    } catch (error) {
      console.error("Error connecting Microsoft:", error);
      Alert.alert("Connection Failed", "Failed to connect your Microsoft account. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectMicrosoft = async () => {
    Alert.alert(
      "Disconnect Microsoft Account",
      "Are you sure you want to disconnect your Microsoft account? You can reconnect anytime.",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Disconnect",
          onPress: async () => {
            try {
              await MicrosoftOAuthService.clearToken();
              setIsAuthenticated(false);
              setMicrosoftEmail(null);
              Alert.alert("Disconnected", "Your Microsoft account has been disconnected.");
            } catch (error) {
              Alert.alert("Error", "Failed to disconnect your account.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Logout",
          onPress: async () => {
            try {
              setLoading(true);
              await logoutMutation.mutateAsync();
              // Navigation will be handled by auth context
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-8 gap-10">
          {/* Header */}
          <View className="gap-3">
            <Text className="text-5xl font-bold text-foreground">Profile</Text>
            <Text className="text-xl text-muted">Manage your account</Text>
          </View>

          {/* Account Section */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">Account</Text>

            {user && (
              <View
                className="rounded-2xl p-8 gap-4"
                style={{ backgroundColor: colors.surface }}
              >
                <View className="gap-2">
                  <Text className="text-base text-muted">Name</Text>
                  <Text className="text-xl font-semibold text-foreground">
                    {user.name || "Not set"}
                  </Text>
                </View>

                <View className="gap-2">
                  <Text className="text-base text-muted">Email</Text>
                  <Text className="text-xl font-semibold text-foreground">
                    {user.email || "Not set"}
                  </Text>
                </View>

                <View className="gap-2">
                  <Text className="text-base text-muted">Login Method</Text>
                  <Text className="text-xl font-semibold text-foreground capitalize">
                    {user.loginMethod || "Unknown"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Microsoft Integration Section */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">Microsoft Integration</Text>

            {isAuthenticated && microsoftEmail ? (
              <View
                className="rounded-2xl p-8 gap-4 border-l-8"
                style={{
                  backgroundColor: colors.surface,
                  borderLeftColor: colors.success,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">✓</Text>
                  <View className="flex-1">
                    <Text className="text-base text-muted">Connected</Text>
                    <Text className="text-lg font-semibold text-foreground">
                      {microsoftEmail}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleDisconnectMicrosoft}
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Disconnect Account
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                className="rounded-2xl p-8 gap-4"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-base text-muted">
                  Connect your Microsoft account to automatically sync your Bing Rewards data.
                </Text>

                <TouchableOpacity
                  onPress={handleConnectMicrosoft}
                  disabled={connecting}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    opacity: connecting ? 0.6 : 1,
                  }}
                >
                  {connecting ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text
                      style={{
                        color: colors.background,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Connect Microsoft Account
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Automation Preferences Section */}
          <View className="gap-4">
            <Text className="text-2xl font-semibold text-foreground">
              Automation Preferences
            </Text>

            <View
              className="rounded-2xl p-8 gap-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    Background Sync
                  </Text>
                  <Text className="text-base text-muted">
                    Automatically sync metrics daily
                  </Text>
                </View>
                <View
                  style={{
                    width: 50,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: colors.success,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>ON</Text>
                </View>
              </View>
            </View>

            <View
              className="rounded-2xl p-8 gap-4"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    Notifications
                  </Text>
                  <Text className="text-base text-muted">
                    Get alerts for new opportunities
                  </Text>
                </View>
                <View
                  style={{
                    width: 50,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: colors.success,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>ON</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loading}
            style={{
              backgroundColor: colors.error,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 20,
              alignItems: "center",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Logout
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
