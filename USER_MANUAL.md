# Bing Rewards Automator - User Manual

**Version 1.0.0** | Last Updated: July 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Installation Guide](#installation-guide)
3. [Getting Started](#getting-started)
4. [Features & Usage](#features--usage)
5. [Settings & Configuration](#settings--configuration)
6. [Anti-Detection Measures](#anti-detection-measures)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)
9. [Account Safety Best Practices](#account-safety-best-practices)

---

## Overview

The **Bing Rewards Automator** is a dual-platform tool that automates Bing Rewards searches on both Microsoft Edge (desktop) and Android mobile devices. It helps you earn Bing Rewards points efficiently by automating daily searches while incorporating anti-detection measures to minimize the risk of account restrictions.

### Key Features

- **Dual-Platform Support**: Works on Windows/Mac (Edge extension) and Android (mobile app)
- **Manual & Automatic Modes**: Perform single searches or run automated daily quotas
- **Anti-Detection Technology**: Randomized delays, user-agent rotation, and localized searches
- **Real-Time Counters**: Track points earned and searches completed
- **Tier Support**: Configured for Member, Silver, Gold, and Legacy Bing Rewards tiers
- **Activity Logging**: Monitor search history and automation status
- **Light Theme UI**: Clean, intuitive interface optimized for ease of use

### Supported Platforms

| Platform | Minimum Version | Status |
|----------|-----------------|--------|
| Microsoft Edge | 90+ | ✅ Fully Supported |
| Windows 10/11 | Latest | ✅ Fully Supported |
| macOS | 10.15+ | ✅ Fully Supported |
| Android | 8.0+ | ✅ Fully Supported |
| iOS | Not Supported | ❌ Not Available |

---

## Installation Guide

### Microsoft Edge Extension Installation

#### Step 1: Download the Extension Files

1. Visit the GitHub repository: https://github.com/jondrippa/bing-search-automator
2. Click the green **Code** button and select **Download ZIP**
3. Extract the ZIP file to a folder on your computer
4. Navigate to the `edge-extension` folder

#### Step 2: Enable Developer Mode in Edge

1. Open Microsoft Edge
2. Type `edge://extensions/` in the address bar and press Enter
3. Toggle **Developer mode** in the bottom-left corner (it should turn blue)

#### Step 3: Load the Extension

1. Click **Load unpacked** button that appears after enabling Developer mode
2. Navigate to and select the `edge-extension` folder from your downloaded files
3. Click **Select Folder**
4. The extension should now appear in your extensions list with a blue icon

#### Step 4: Verify Installation

1. You should see the Bing Rewards Automator icon in your Edge toolbar
2. Click the icon to open the popup and confirm it displays the dashboard
3. You're ready to start using the extension!

### Android App Installation

#### Option 1: Using Expo Go (Recommended for Testing)

1. Install **Expo Go** from the Google Play Store on your Android device
2. On your computer, navigate to the project folder: `cd /path/to/bing-search-automator`
3. Run the development server: `pnpm dev`
4. A QR code will appear in the terminal
5. Open Expo Go on your Android device and scan the QR code
6. The app will load and you can start using it immediately

#### Option 2: Building an APK (For Production Use)

1. Ensure you have Node.js and pnpm installed
2. Navigate to the project folder: `cd /path/to/bing-search-automator`
3. Run the build command: `pnpm build:android`
4. Wait for the APK to be generated (this may take 10-15 minutes)
5. Transfer the APK file to your Android device
6. Open the file manager on your Android device and tap the APK file
7. Follow the installation prompts and grant necessary permissions
8. The app will appear on your home screen as "Bing Rewards Automator"

#### Option 3: Play Store (When Available)

Future versions may be available on the Google Play Store. Check back for updates.

---

## Getting Started

### First-Time Setup

#### For Edge Extension:

1. Click the extension icon in your toolbar
2. The popup will display:
   - **Status**: Currently shows "Idle"
   - **Points Counter**: Shows 0 points
   - **Searches Counter**: Shows 0/12 (or based on your tier)
3. Select your preferred mode: **PC Search** or **Mobile Search**
4. Click **Settings** to configure your Bing Rewards tier (optional)
5. You're ready to start!

#### For Android App:

1. Open the Bing Rewards Automator app
2. The home screen displays:
   - **Status Badge**: Shows "Ready"
   - **Points Counter**: Shows 0 points
   - **Searches Counter**: Shows 0/12 (or based on your tier)
3. Tap **Settings** tab to configure your preferences
4. Return to the **Home** tab to start searching
5. You're ready to go!

### Your First Search

#### Manual Search (Single Search)

1. Open the extension popup or mobile app
2. Select your desired mode: **PC Search** or **Mobile Search**
3. Click/Tap **Start Manual (1)**
4. The app will perform one search and display the result
5. You'll earn approximately 5 points per search

#### Automatic Search (Daily Quota)

1. Open the extension popup or mobile app
2. Select your desired mode: **PC Search** or **Mobile Search**
3. Click/Tap **Start Automatic**
4. The app will begin performing searches automatically
5. A status badge will show "Searching..." with progress
6. Searches will continue until your daily quota is reached
7. You'll receive a notification when complete

---

## Features & Usage

### Dashboard Overview

The main dashboard displays key information about your automation progress:

| Element | Description |
|---------|-------------|
| **Status Badge** | Shows current state: "Idle", "Searching...", or "Paused" |
| **Points Counter** | Total points earned in the current session |
| **Searches Counter** | Number of searches completed out of daily maximum |
| **Mode Selector** | Toggle between "PC Search" and "Mobile Search" |
| **Control Buttons** | Start Automatic, Start Manual, or Stop |
| **Activity Log** | Recent search history with timestamps |

### Search Modes Explained

#### PC Search Mode

- **Daily Quota**: Varies by tier (Member: 3, Silver: 6, Gold: 12, Legacy: 30)
- **Points per Search**: Approximately 5 points
- **Best For**: Desktop users who want to earn points while working
- **Recommended Tier**: Gold (12 searches = 60 points)

#### Mobile Search Mode

- **Daily Quota**: Varies by tier (Member: 2, Silver: 4, Gold: 20, Legacy: 20)
- **Points per Search**: Approximately 5 points
- **Best For**: Mobile users or those using mobile emulation
- **Recommended Tier**: Gold (20 searches = 100 points)

### Control Buttons

#### Start Automatic

Initiates automated searches for your entire daily quota.

- **What it does**: Performs searches at randomized intervals (15-32 seconds apart)
- **Duration**: Typically 5-15 minutes depending on your tier
- **When to use**: When you want to earn your daily points without manual intervention
- **Status**: Button changes to "Stop" while running

#### Start Manual (1)

Performs a single search immediately.

- **What it does**: Executes one search and awards points
- **Duration**: 2-3 seconds
- **When to use**: When you want to test the app or earn a quick point
- **Status**: Completes immediately and returns to "Ready"

#### Stop

Halts the current automation process.

- **What it does**: Stops all ongoing searches
- **When to use**: If you need to interrupt the automation
- **Note**: Your current progress is saved; you can resume later

### Activity Log

The activity log at the bottom of the dashboard shows:

- **Timestamp**: When each action occurred
- **Search Keyword**: The search term used
- **Status**: Whether the search was successful
- **Points Earned**: Points awarded for that search

**Example Log Entry:**
```
[11:30:45] Searched: "weather in New York" (1/12)
[11:31:02] Searched: "best restaurants" (2/12)
[11:31:19] Starting automatic desktop searches...
```

---

## Settings & Configuration

### Accessing Settings

**Edge Extension**: Click the extension icon → Click **Settings** link at the bottom

**Android App**: Tap the **Settings** tab at the bottom of the screen

### Available Settings

#### Rewards Tier

Select your current Bing Rewards tier to set the correct daily search quota:

| Tier | PC Searches | Mobile Searches | Points (PC) | Points (Mobile) |
|------|------------|-----------------|------------|-----------------|
| **Member** | 3 | 2 | 15 | 10 |
| **Silver** | 6 | 4 | 30 | 20 |
| **Gold** | 12 | 20 | 60 | 100 |
| **Legacy** | 30 | 20 | 150 | 100 |

**How to Check Your Tier**: Visit https://www.bing.com/rewards/dashboard and look for your tier badge.

#### Search Interval (seconds)

Controls the delay between searches to simulate human behavior.

- **Minimum**: 5-60 seconds (default: 15)
- **Maximum**: 5-120 seconds (default: 32)
- **Recommendation**: Keep default values (15-32) for best results
- **Why**: Randomized intervals help avoid detection as automated activity

#### Anti-Detection Options

**Rotate User-Agent** (Enabled by default)
- Changes the browser identifier with each search
- Makes searches appear to come from different devices
- **Recommendation**: Keep enabled

**Use Localized Searches** (Enabled by default)
- Fetches trending searches based on your IP location
- Makes searches appear more natural and relevant
- **Recommendation**: Keep enabled

**15-min Cooldown (every 3 searches)** (Disabled by default)
- Adds a 15-minute pause after every 3 searches
- Provides extra safety by mimicking human behavior
- **Recommendation**: Enable if you're concerned about account safety

### Saving Settings

1. Adjust your preferred settings
2. Click/Tap **Save Settings**
3. You'll see a confirmation message
4. Settings are saved automatically for future sessions

### Resetting to Defaults

1. Click/Tap **Reset to Defaults**
2. Confirm the action when prompted
3. All settings return to factory defaults
4. This does NOT affect your search history or points

---

## Anti-Detection Measures

The Bing Rewards Automator incorporates multiple anti-detection strategies to minimize the risk of account restrictions. Understanding these measures helps you use the tool safely.

### How Anti-Detection Works

#### 1. Variable Search Intervals

**What it does**: Searches are spaced at randomized intervals rather than fixed times.

**Why it matters**: Bing's systems can detect patterns of automated activity. Variable intervals mimic human behavior.

**Example**:
- Without anti-detection: Search at 11:00, 11:05, 11:10 (fixed 5-minute intervals)
- With anti-detection: Search at 11:00, 11:18, 11:31 (randomized intervals)

#### 2. User-Agent Rotation

**What it does**: Each search may use a different browser identifier.

**Why it matters**: Bing can detect if all searches come from the same exact browser/device configuration.

**Example**:
- Search 1: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0"
- Search 2: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0"

#### 3. Localized Trending Searches

**What it does**: Keywords are fetched based on your IP address location.

**Why it matters**: Natural searches are location-relevant. Searching for "weather in Tokyo" from a Tokyo IP looks more human than from New York.

**Example**:
- Your IP: New York
- Generated searches: "weather in New York", "best restaurants in NYC", "New York events"

#### 4. Human-Like Scrolling

**What it does**: Simulates scrolling through search results pages.

**Why it matters**: Real users scroll through results; bots don't. This simulation adds authenticity.

#### 5. Random Delays Between Requests

**What it does**: Adds 500-2000ms random delays between internal requests.

**Why it matters**: Prevents rapid-fire requests that look like bot activity.

#### 6. Optional Cooldown Periods

**What it does**: Pauses for 15 minutes after every 3 searches (if enabled).

**Why it matters**: Provides extra safety by creating realistic usage patterns.

### Best Practices for Using Anti-Detection

1. **Keep Default Settings**: The default configuration is optimized for safety
2. **Enable Localized Searches**: Always keep this enabled for natural-looking queries
3. **Don't Modify Intervals Too Much**: Intervals below 10 seconds or above 60 seconds may look suspicious
4. **Use Cooldowns for Extra Safety**: If you're concerned, enable the 15-minute cooldown
5. **Vary Your Usage Times**: Don't run searches at the exact same time every day
6. **Monitor Your Account**: Check your Bing Rewards dashboard regularly for any warnings

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Extension Icon Not Appearing

**Problem**: After installation, the extension icon doesn't show in the toolbar.

**Solutions**:
1. Verify Developer mode is enabled: `edge://extensions/` → Check "Developer mode" toggle
2. Check if extension is enabled: Look for the extension in the list and ensure it's toggled on
3. Reload Edge: Close and reopen Microsoft Edge
4. Reinstall: Remove the extension and repeat the installation steps

#### Issue: "Cannot find name 'ActivityIndicator'" Error

**Problem**: The mobile app shows a compilation error.

**Solutions**:
1. Clear cache: `pnpm store prune`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Restart dev server: Stop the current session and run `pnpm dev` again
4. Rebuild APK: If using production APK, rebuild with `pnpm build:android`

#### Issue: Searches Not Starting

**Problem**: Clicking "Start Automatic" or "Start Manual" has no effect.

**Solutions**:
1. **Check Bing.com Access**: Ensure you can access https://www.bing.com manually
2. **Verify Internet Connection**: Confirm your device has active internet
3. **Check Permissions**: 
   - Edge: Ensure extension has permission to access bing.com
   - Android: Go to Settings → Apps → Bing Rewards Automator → Permissions → Enable Internet
4. **Restart the Tool**:
   - Edge: Click extension icon and reload
   - Android: Close and reopen the app
5. **Check Daily Quota**: If searches show "0/0", you may have already completed your daily quota

#### Issue: Points Not Increasing

**Problem**: Searches complete but points remain at 0.

**Solutions**:
1. **Verify Bing Login**: Ensure you're logged into your Microsoft account on Bing.com
2. **Check Account Status**: Visit https://www.bing.com/rewards/dashboard to verify your account is active
3. **Wait for Sync**: Points may take 1-2 minutes to appear in the dashboard
4. **Manual Verification**: Perform a manual search on Bing.com and check if points are awarded
5. **Contact Support**: If points still don't increase, contact Microsoft Rewards support

#### Issue: App Crashes on Android

**Problem**: The mobile app crashes when opening or during searches.

**Solutions**:
1. **Clear App Cache**: Settings → Apps → Bing Rewards Automator → Storage → Clear Cache
2. **Update Android**: Ensure your device is running Android 8.0 or later
3. **Reinstall App**: Uninstall and reinstall the APK
4. **Check Storage**: Ensure your device has at least 100MB free storage
5. **Disable Battery Saver**: Battery optimization may interfere with background tasks

#### Issue: Extension Popup Shows "Idle" But Searches Are Running

**Problem**: Status doesn't update in real-time.

**Solutions**:
1. **Refresh Popup**: Close and reopen the extension popup
2. **Check Service Worker**: The background process may still be running even if UI doesn't update
3. **Check Activity Log**: Look at the mobile app's activity log to verify searches are happening
4. **Restart Extension**: Disable and re-enable the extension in `edge://extensions/`

### Performance Issues

#### Slow Search Performance

**Symptoms**: Searches take longer than expected to complete.

**Solutions**:
1. Check internet speed: https://www.speedtest.net
2. Reduce search interval: Lower the minimum interval in settings
3. Close other browser tabs: Frees up resources
4. Restart browser: Clears memory and cache

#### High Battery Drain (Mobile)

**Symptoms**: Battery depletes quickly while using the app.

**Solutions**:
1. Reduce screen brightness
2. Enable Battery Saver mode after searches complete
3. Close other apps running in background
4. Limit automatic searches to specific times of day

---

## FAQ

### General Questions

**Q: Is using this tool against Bing Rewards terms of service?**

A: Bing Rewards explicitly prohibits automated searching. Using this tool violates their terms and carries the risk of account suspension. Use at your own risk and responsibility.

**Q: Will my account get banned?**

A: The tool includes anti-detection measures to minimize risk, but there's no guarantee. Microsoft actively monitors for automation. Accounts using automation tools may be suspended or permanently banned.

**Q: How many points can I earn per day?**

A: Depends on your tier and activity:
- Member: 15 points (PC) + 10 points (Mobile) = 25 points/day
- Silver: 30 points (PC) + 20 points (Mobile) = 50 points/day
- Gold: 60 points (PC) + 100 points (Mobile) = 160 points/day
- Legacy: 150 points (PC) + 100 points (Mobile) = 250 points/day

**Q: Can I use both the extension and app simultaneously?**

A: Yes, but they track searches separately. The extension tracks PC/Mobile searches independently from the mobile app. You may want to use the extension for PC searches and the app for mobile searches to maximize points.

**Q: Does the tool work on iOS?**

A: No, the mobile app is Android-only. iOS users can only use the Edge extension on desktop.

### Technical Questions

**Q: What data does the tool collect?**

A: The tool only stores:
- Search count and points (locally on your device)
- Your configured tier and settings
- Activity log (recent searches)

No personal data is sent to external servers except when fetching localized keywords from ipapi.co.

**Q: Can I modify the search keywords?**

A: The tool automatically generates keywords based on your location. You cannot manually specify keywords, as this is by design to maintain anti-detection measures.

**Q: How often are searches performed?**

A: Searches are performed at randomized intervals between your configured minimum and maximum (default: 15-32 seconds).

**Q: Can I run searches in the background?**

A: **Edge Extension**: Yes, searches run in the background via the service worker.

**Android App**: Partially. The app needs to remain open or in the foreground. Background execution is limited by Android's battery optimization policies.

### Account Safety Questions

**Q: What should I do if my account gets restricted?**

A: 1. Stop using the tool immediately
2. Contact Microsoft Rewards support
3. Explain that you were using an automated tool and request account review
4. Wait for Microsoft's response (typically 1-2 weeks)

**Q: How can I reduce the risk of being detected?**

A: 1. Keep all anti-detection settings enabled
2. Enable the 15-minute cooldown option
3. Vary your usage times (don't run at the same time daily)
4. Limit usage to once per day
5. Monitor your account for warnings
6. Use a VPN to rotate your IP address (optional)

**Q: Should I use a VPN?**

A: Using a VPN can add an extra layer of obfuscation, but it's not required. If you do use a VPN, ensure it's a reputable service and that your IP location matches your account's typical location.

---

## Account Safety Best Practices

### Before You Start

1. **Read Bing Rewards Terms**: Understand that automation violates terms of service
2. **Accept the Risk**: Use this tool only if you're willing to accept potential account suspension
3. **Create a Backup Account**: Consider having a secondary Microsoft account as backup
4. **Document Your Setup**: Take screenshots of your configuration for reference

### During Usage

1. **Monitor Your Account**: Check https://www.bing.com/rewards/dashboard weekly
2. **Watch for Warnings**: If you see any account alerts, stop using the tool immediately
3. **Keep Settings Optimized**: Don't disable anti-detection features
4. **Vary Your Patterns**: Don't run searches at the exact same time every day
5. **Use Realistic Intervals**: Keep search intervals between 15-60 seconds
6. **Enable Cooldowns**: Use the 15-minute cooldown option for extra safety

### Red Flags to Watch For

If you see any of these, stop using the tool immediately:

- Account warning messages on Bing Rewards dashboard
- Searches not awarding points
- Unable to redeem points
- Account temporarily restricted message
- Unusual login activity alerts from Microsoft

### If Your Account Gets Restricted

1. **Stop Immediately**: Uninstall the tool and don't use it again
2. **Contact Support**: Go to https://support.microsoft.com/en-us/account-billing
3. **Be Honest**: Explain that you used an automated tool
4. **Request Review**: Ask Microsoft to review your account
5. **Wait**: Microsoft typically responds within 1-2 weeks
6. **Learn**: If reinstated, use the tool more conservatively or not at all

### Long-Term Safety Strategy

1. **Limit Frequency**: Use the tool no more than once per day
2. **Mix Manual and Automatic**: Perform some searches manually to appear human
3. **Randomize Times**: Run automation at different times each day
4. **Monitor Points**: If points suddenly stop increasing, investigate immediately
5. **Keep Backups**: Maintain a secondary account in case your primary is suspended

---

## Support & Resources

### Getting Help

- **GitHub Issues**: Report bugs at https://github.com/jondrippa/bing-search-automator/issues
- **Microsoft Rewards Support**: https://support.microsoft.com/en-us/rewards
- **Bing Rewards Dashboard**: https://www.bing.com/rewards/dashboard

### Additional Resources

- **Bing Rewards Official Site**: https://www.bing.com/rewards
- **Microsoft Account Security**: https://account.microsoft.com/security
- **Edge Extensions Help**: https://support.microsoft.com/en-us/microsoft-edge/add-turn-off-or-remove-extensions-in-microsoft-edge

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | July 2026 | Initial release with Edge extension and Android app |

---

## Disclaimer

**IMPORTANT**: This tool automates Bing Rewards searches, which violates Microsoft's terms of service. Using this tool is at your own risk. The developers are not responsible for:

- Account suspensions or permanent bans
- Loss of Bing Rewards points or redemptions
- Any other consequences resulting from tool usage

By using this tool, you acknowledge that you understand the risks and accept full responsibility for any account actions taken by this automation.

---

**Last Updated**: July 2026 | **Maintained By**: Bing Rewards Automator Community
