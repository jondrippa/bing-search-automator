import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { microsoftAuthService, type UserProfile } from "@/lib/microsoft-auth";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const colors = useColors();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    checkAuthStatus();

    // Set up deep link listener for OAuth callback
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, []);

  // Check current auth status
  const checkAuthStatus = async () => {
    try {
      const authenticated = await microsoftAuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const profile = await microsoftAuthService.getUserProfile();
        setUserProfile(profile);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    }
  };

  // Handle OAuth callback
  const handleDeepLink = async (event: { url: string }) => {
    const url = event.url;

    // Extract authorization code from URL
    const match = url.match(/code=([^&]+)/);
    if (match) {
      const code = match[1];
      await handleAuthCallback(code);
    }
  };

  // Handle auth callback with code
  const handleAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await microsoftAuthService.exchangeCodeForToken(code);

      if (token) {
        setIsAuthenticated(true);
        const profile = await microsoftAuthService.getUserProfile();
        setUserProfile(profile);
      } else {
        setError("Failed to authenticate. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Start login flow
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const authUrl = microsoftAuthService.generateAuthUrl();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        "manusmicrosoft://oauth/callback"
      );

      if (result.type === "success") {
        const url = result.url;
        const match = url.match(/code=([^&]+)/);

        if (match) {
          const code = match[1];
          await handleAuthCallback(code);
        }
      } else if (result.type === "cancel") {
        setError("Login cancelled");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await microsoftAuthService.logout();
      setIsAuthenticated(false);
      setUserProfile(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="items-center gap-2 pt-4">
            <Text className="text-3xl font-bold text-foreground">Account</Text>
            <Text className="text-sm text-muted">Microsoft Rewards</Text>
          </View>

          {isAuthenticated && userProfile ? (
            <>
              {/* User Profile Card */}
              <View
                className="rounded-2xl p-6 gap-4"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {/* Avatar Placeholder */}
                <View className="items-center">
                  <View
                    className="w-16 h-16 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-2xl font-bold text-white">
                      {userProfile.displayName?.charAt(0).toUpperCase() || "U"}
                    </Text>
                  </View>
                </View>

                {/* User Info */}
                <View className="gap-3">
                  <View>
                    <Text className="text-xs text-muted font-semibold uppercase">
                      Name
                    </Text>
                    <Text className="text-lg font-bold text-foreground">
                      {userProfile.displayName}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-xs text-muted font-semibold uppercase">
                      Email
                    </Text>
                    <Text className="text-sm text-foreground">{userProfile.email}</Text>
                  </View>

                  {userProfile.rewardsPoints && (
                    <View>
                      <Text className="text-xs text-muted font-semibold uppercase">
                        Rewards Points
                      </Text>
                      <Text className="text-lg font-bold text-primary">
                        {userProfile.rewardsPoints.toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {userProfile.tier && (
                    <View>
                      <Text className="text-xs text-muted font-semibold uppercase">
                        Tier
                      </Text>
                      <Text className="text-sm font-semibold text-foreground capitalize">
                        {userProfile.tier}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Divider */}
                <View
                  style={{ height: 1, backgroundColor: colors.border }}
                />

                {/* Account ID */}
                <View>
                  <Text className="text-xs text-muted font-semibold uppercase">
                    Account ID
                  </Text>
                  <Text className="text-xs text-muted font-mono">
                    {userProfile.id}
                  </Text>
                </View>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                onPress={handleLogout}
                disabled={isLoading}
                className="bg-error rounded-lg py-4 items-center active:opacity-80"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Logout
                  </Text>
                )}
              </TouchableOpacity>

              {/* Info Box */}
              <View
                className="rounded-xl p-4 gap-2"
                style={{
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.success,
                }}
              >
                <Text className="text-sm font-semibold text-foreground">
                  ✅ Authenticated
                </Text>
                <Text className="text-xs text-muted">
                  Your account is securely connected. Your data is encrypted and stored locally.
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Login Illustration */}
              <View className="items-center gap-4 py-8">
                <Text className="text-5xl">🔐</Text>
                <Text className="text-lg font-semibold text-foreground text-center">
                  Secure Login
                </Text>
                <Text className="text-sm text-muted text-center">
                  Sign in with your Microsoft account to access your Bing Rewards
                </Text>
              </View>

              {/* Features List */}
              <View className="gap-3">
                <View className="flex-row gap-3 items-start">
                  <Text className="text-lg">✓</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Secure Authentication
                    </Text>
                    <Text className="text-xs text-muted">
                      OAuth 2.0 with Microsoft Entra ID
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 items-start">
                  <Text className="text-lg">✓</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Automatic Token Refresh
                    </Text>
                    <Text className="text-xs text-muted">
                      Stay logged in without re-authenticating
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 items-start">
                  <Text className="text-lg">✓</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Encrypted Storage
                    </Text>
                    <Text className="text-xs text-muted">
                      Tokens stored securely in device keychain
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 items-start">
                  <Text className="text-lg">✓</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Sync Rewards Data
                    </Text>
                    <Text className="text-xs text-muted">
                      View your points and tier information
                    </Text>
                  </View>
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <View
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: colors.error,
                    opacity: 0.15,
                  }}
                >
                  <Text className="text-sm font-semibold text-error">
                    ⚠️ {error}
                  </Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-primary rounded-lg py-4 items-center active:opacity-80"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Sign In with Microsoft
                  </Text>
                )}
              </TouchableOpacity>

              {/* Privacy Notice */}
              <View
                className="rounded-xl p-4 gap-2"
                style={{
                  backgroundColor: colors.surface,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.warning,
                }}
              >
                <Text className="text-xs font-semibold text-foreground">
                  🔒 Privacy & Security
                </Text>
                <Text className="text-xs text-muted leading-relaxed">
                  We never store your password. Authentication is handled securely by Microsoft. Your tokens are encrypted and stored locally on your device only.
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
