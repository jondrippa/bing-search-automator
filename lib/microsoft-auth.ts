/**
 * Microsoft OAuth Authentication Service
 * Handles OAuth 2.0 authentication with Microsoft Entra ID (Azure AD)
 * Supports both mobile (Expo) and web (Edge extension)
 */

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Microsoft OAuth Configuration
const MICROSOFT_OAUTH_CONFIG = {
  clientId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46", // Bing Rewards mobile app client ID
  authority: "https://login.microsoftonline.com/common",
  redirectUri:
    Platform.OS === "web"
      ? "https://rewards.bing.com/oauth/callback"
      : "manusmicrosoft://oauth/callback", // Custom scheme for mobile
  scopes: [
    "https://rewards.microsoft.com/.default",
    "offline_access",
    "profile",
    "email",
  ],
};

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  idToken?: string;
  scope: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  rewardsPoints?: number;
  tier?: string;
}

class MicrosoftAuthService {
  private tokenKey = "microsoft_auth_token";
  private userKey = "microsoft_user_profile";
  private tokenRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initialize auth service and check for existing session
   */
  async initialize(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (token) {
        // Check if token is expired
        if (token.expiresAt < Date.now()) {
          // Try to refresh
          return await this.refreshToken();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Auth initialization error:", error);
      return false;
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: MICROSOFT_OAUTH_CONFIG.clientId,
      response_type: "code",
      redirect_uri: MICROSOFT_OAUTH_CONFIG.redirectUri,
      scope: MICROSOFT_OAUTH_CONFIG.scopes.join(" "),
      response_mode: "query",
      prompt: "select_account",
    });

    return `${MICROSOFT_OAUTH_CONFIG.authority}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<AuthToken | null> {
    try {
      const params = new URLSearchParams({
        client_id: MICROSOFT_OAUTH_CONFIG.clientId,
        code,
        redirect_uri: MICROSOFT_OAUTH_CONFIG.redirectUri,
        grant_type: "authorization_code",
        scope: MICROSOFT_OAUTH_CONFIG.scopes.join(" "),
      });

      const response = await fetch(
        `${MICROSOFT_OAUTH_CONFIG.authority}/oauth2/v2.0/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data = await response.json();

      const token: AuthToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        idToken: data.id_token,
        scope: data.scope,
      };

      // Store token securely
      await this.storeToken(token);

      // Fetch and store user profile
      await this.fetchUserProfile(token.accessToken);

      // Set up auto-refresh
      this.setupTokenRefresh(token);

      return token;
    } catch (error) {
      console.error("Token exchange error:", error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const token = await this.getStoredToken();
      if (!token?.refreshToken) {
        return false;
      }

      const params = new URLSearchParams({
        client_id: MICROSOFT_OAUTH_CONFIG.clientId,
        refresh_token: token.refreshToken,
        grant_type: "refresh_token",
        scope: MICROSOFT_OAUTH_CONFIG.scopes.join(" "),
      });

      const response = await fetch(
        `${MICROSOFT_OAUTH_CONFIG.authority}/oauth2/v2.0/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();

      const newToken: AuthToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || token.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
        idToken: data.id_token,
        scope: data.scope,
      };

      await this.storeToken(newToken);
      this.setupTokenRefresh(newToken);

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      await this.logout();
      return false;
    }
  }

  /**
   * Fetch user profile from Microsoft Graph API
   */
  private async fetchUserProfile(accessToken: string): Promise<void> {
    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();

      const profile: UserProfile = {
        id: data.id,
        displayName: data.displayName || data.userPrincipalName,
        email: data.mail || data.userPrincipalName,
        profilePicture: data.picture,
      };

      // Try to fetch Bing Rewards data
      try {
        const rewardsResponse = await fetch(
          "https://rewards.microsoft.com/api/user/profile",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (rewardsResponse.ok) {
          const rewardsData = await rewardsResponse.json();
          profile.rewardsPoints = rewardsData.totalPoints;
          profile.tier = rewardsData.userStatus;
        }
      } catch (error) {
        console.warn("Could not fetch Bing Rewards data:", error);
      }

      await this.storeUserProfile(profile);
    } catch (error) {
      console.error("User profile fetch error:", error);
    }
  }

  /**
   * Get stored authentication token
   */
  async getStoredToken(): Promise<AuthToken | null> {
    try {
      if (Platform.OS === "web") {
        const stored = localStorage.getItem(this.tokenKey);
        return stored ? JSON.parse(stored) : null;
      } else {
        const stored = await SecureStore.getItemAsync(this.tokenKey);
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error("Error retrieving stored token:", error);
      return null;
    }
  }

  /**
   * Store authentication token securely
   */
  private async storeToken(token: AuthToken): Promise<void> {
    try {
      const tokenStr = JSON.stringify(token);
      if (Platform.OS === "web") {
        localStorage.setItem(this.tokenKey, tokenStr);
      } else {
        await SecureStore.setItemAsync(this.tokenKey, tokenStr);
      }
    } catch (error) {
      console.error("Error storing token:", error);
    }
  }

  /**
   * Get stored user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      return null;
    }
  }

  /**
   * Store user profile
   */
  private async storeUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.userKey, JSON.stringify(profile));
    } catch (error) {
      console.error("Error storing user profile:", error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return token !== null && token.expiresAt > Date.now();
  }

  /**
   * Get access token (refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    const token = await this.getStoredToken();

    if (!token) {
      return null;
    }

    // Refresh if expiring within 5 minutes
    if (token.expiresAt - Date.now() < 5 * 60 * 1000) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        return null;
      }
      const newToken = await this.getStoredToken();
      return newToken?.accessToken || null;
    }

    return token.accessToken;
  }

  /**
   * Setup automatic token refresh
   */
  private setupTokenRefresh(token: AuthToken): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // Refresh 5 minutes before expiration
    const timeUntilRefresh = token.expiresAt - Date.now() - 5 * 60 * 1000;

    if (timeUntilRefresh > 0) {
      this.tokenRefreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, timeUntilRefresh);
    }
  }

  /**
   * Logout and clear stored data
   */
  async logout(): Promise<void> {
    try {
      if (this.tokenRefreshTimeout) {
        clearTimeout(this.tokenRefreshTimeout);
      }

      if (Platform.OS === "web") {
        localStorage.removeItem(this.tokenKey);
      } else {
        await SecureStore.deleteItemAsync(this.tokenKey);
      }

      await AsyncStorage.removeItem(this.userKey);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  /**
   * Get authorization header for API requests
   */
  async getAuthHeader(): Promise<Record<string, string> | null> {
    const token = await this.getAccessToken();
    if (!token) {
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }
}

// Export singleton instance
export const microsoftAuthService = new MicrosoftAuthService();

export default microsoftAuthService;
