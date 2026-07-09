/**
 * Microsoft OAuth Authentication Service for Edge Extension
 * Handles OAuth 2.0 authentication with Microsoft Entra ID
 */

const MICROSOFT_OAUTH_CONFIG = {
  clientId: "04b07795-8ddb-461a-bbee-02f9e1bf7b46",
  authority: "https://login.microsoftonline.com/common",
  redirectUri: chrome.identity.getRedirectURL("oauth2"),
  scopes: [
    "https://rewards.microsoft.com/.default",
    "offline_access",
    "profile",
    "email",
  ],
};

class EdgeAuthService {
  constructor() {
    this.tokenKey = "microsoft_auth_token";
    this.userKey = "microsoft_user_profile";
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl() {
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
   * Start OAuth flow using chrome.identity API
   */
  async startOAuthFlow() {
    return new Promise((resolve, reject) => {
      const authUrl = this.generateAuthUrl();

      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        (redirectUrl) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!redirectUrl) {
            reject(new Error("Auth cancelled"));
            return;
          }

          // Extract authorization code
          const url = new URL(redirectUrl);
          const code = url.searchParams.get("code");

          if (!code) {
            reject(new Error("No authorization code received"));
            return;
          }

          resolve(code);
        }
      );
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code) {
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

      const token = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
        idToken: data.id_token,
        scope: data.scope,
      };

      // Store token
      await this.storeToken(token);

      // Fetch user profile
      await this.fetchUserProfile(token.accessToken);

      return token;
    } catch (error) {
      console.error("Token exchange error:", error);
      throw error;
    }
  }

  /**
   * Fetch user profile from Microsoft Graph API
   */
  async fetchUserProfile(accessToken) {
    try {
      const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();

      const profile = {
        id: data.id,
        displayName: data.displayName || data.userPrincipalName,
        email: data.mail || data.userPrincipalName,
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
      return profile;
    } catch (error) {
      console.error("User profile fetch error:", error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const token = await this.getStoredToken();
      if (!token?.refreshToken) {
        throw new Error("No refresh token available");
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

      const newToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || token.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
        idToken: data.id_token,
        scope: data.scope,
      };

      await this.storeToken(newToken);
      return newToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      await this.logout();
      throw error;
    }
  }

  /**
   * Get stored token
   */
  async getStoredToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.tokenKey], (result) => {
        resolve(result[this.tokenKey] || null);
      });
    });
  }

  /**
   * Store token securely
   */
  async storeToken(token) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.tokenKey]: token }, resolve);
    });
  }

  /**
   * Get stored user profile
   */
  async getUserProfile() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.userKey], (result) => {
        resolve(result[this.userKey] || null);
      });
    });
  }

  /**
   * Store user profile
   */
  async storeUserProfile(profile) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.userKey]: profile }, resolve);
    });
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated() {
    const token = await this.getStoredToken();
    return token && token.expiresAt > Date.now();
  }

  /**
   * Get access token (refresh if needed)
   */
  async getAccessToken() {
    const token = await this.getStoredToken();

    if (!token) {
      return null;
    }

    // Refresh if expiring within 5 minutes
    if (token.expiresAt - Date.now() < 5 * 60 * 1000) {
      try {
        const refreshed = await this.refreshToken();
        return refreshed.accessToken;
      } catch (error) {
        console.error("Token refresh failed:", error);
        return null;
      }
    }

    return token.accessToken;
  }

  /**
   * Logout
   */
  async logout() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.tokenKey, this.userKey], resolve);
    });
  }
}

// Export singleton
const edgeAuthService = new EdgeAuthService();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "login") {
    edgeAuthService
      .startOAuthFlow()
      .then((code) => edgeAuthService.exchangeCodeForToken(code))
      .then((token) => {
        sendResponse({ success: true, token });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  } else if (request.action === "logout") {
    edgeAuthService
      .logout()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === "getProfile") {
    edgeAuthService
      .getUserProfile()
      .then((profile) => {
        sendResponse({ success: true, profile });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (request.action === "isAuthenticated") {
    edgeAuthService
      .isAuthenticated()
      .then((authenticated) => {
        sendResponse({ success: true, authenticated });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});
