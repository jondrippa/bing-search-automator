import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { trpc } from "./trpc";

const MICROSOFT_CLIENT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || "";
const MICROSOFT_CLIENT_SECRET = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_SECRET || "";
const MICROSOFT_REDIRECT_URI = Linking.createURL("oauth/microsoft");
const MICROSOFT_AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface MicrosoftUserInfo {
  id: string;
  userPrincipalName: string;
  displayName: string;
  mail: string;
}

export class MicrosoftOAuthService {
  /**
   * Get the Microsoft OAuth authorization URL
   */
  static getAuthorizationUrl(): string {
    const scopes = [
      "https://graph.microsoft.com/.default",
      "offline_access",
    ];

    const params = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      redirect_uri: MICROSOFT_REDIRECT_URI,
      response_type: "code",
      scope: scopes.join(" "),
      response_mode: "query",
      prompt: "select_account",
    });

    return `${MICROSOFT_AUTHORITY}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<MicrosoftTokenResponse> {
    const params = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      code,
      redirect_uri: MICROSOFT_REDIRECT_URI,
      grant_type: "authorization_code",
      scope: "https://graph.microsoft.com/.default offline_access",
    });

    const response = await fetch(`${MICROSOFT_AUTHORITY}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    return response.json();
  }

  /**
   * Refresh the access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<MicrosoftTokenResponse> {
    const params = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      client_secret: MICROSOFT_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: "https://graph.microsoft.com/.default offline_access",
    });

    const response = await fetch(`${MICROSOFT_AUTHORITY}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    return response.json();
  }

  /**
   * Get user information from Microsoft Graph
   */
  static async getUserInfo(accessToken: string): Promise<MicrosoftUserInfo> {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  }

  /**
   * Get Bing Rewards data from Microsoft Graph
   */
  static async getBingRewardsData(accessToken: string) {
    try {
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/extensions/com.microsoft.rewards",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching Bing Rewards data:", error);
      return null;
    }
  }

  /**
   * Start the OAuth flow
   */
  static async startOAuthFlow(): Promise<string | null> {
    try {
      await WebBrowser.warmUpAsync();

      const authUrl = this.getAuthorizationUrl();
      const result = await WebBrowser.openAuthSessionAsync(authUrl, MICROSOFT_REDIRECT_URI);

      await WebBrowser.coolDownAsync();

      if (result.type === "success") {
        const url = new URL(result.url);
        const code = url.searchParams.get("code");
        return code;
      }

      return null;
    } catch (error) {
      console.error("OAuth flow error:", error);
      return null;
    }
  }

  /**
   * Save Microsoft token to secure storage
   */
  static async saveToken(token: MicrosoftTokenResponse, email: string): Promise<void> {
    try {
      const tokenData = {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
        email,
      };

      await SecureStore.setItemAsync("microsoft_token", JSON.stringify(tokenData));
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  }

  /**
   * Get saved Microsoft token from secure storage
   */
  static async getToken(): Promise<MicrosoftTokenResponse | null> {
    try {
      const tokenData = await SecureStore.getItemAsync("microsoft_token");
      if (!tokenData) return null;

      const token = JSON.parse(tokenData);
      const expiresAt = new Date(token.expiresAt);

      // Check if token is expired
      if (expiresAt < new Date()) {
        // Token expired, try to refresh
        if (token.refreshToken) {
          const newToken = await this.refreshAccessToken(token.refreshToken);
          await this.saveToken(newToken, token.email);
          return newToken;
        }
        // Can't refresh, token is invalid
        return null;
      }

      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  /**
   * Clear saved Microsoft token
   */
  static async clearToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync("microsoft_token");
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  }

  /**
   * Check if user is authenticated with Microsoft
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}
