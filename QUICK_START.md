# Bing Rewards Automator - Quick Start Guide

Get up and running in 5 minutes!

## For Microsoft Edge Extension

### Installation (2 minutes)

1. Download the project from GitHub
2. Open `edge://extensions/` in Microsoft Edge
3. Enable **Developer mode** (toggle in bottom-left)
4. Click **Load unpacked**
5. Select the `edge-extension` folder
6. Done! Click the extension icon in your toolbar

### First Search (1 minute)

1. Click the extension icon
2. Select **PC Search** or **Mobile Search**
3. Click **Start Manual (1)** to test
4. Or click **Start Automatic** to run your daily quota

### Tips

- ⚙️ Click **Settings** to configure your Bing Rewards tier
- 📊 Watch the counters update as searches complete
- ⏸️ Click **Stop** to pause automation anytime

---

## For Android App

### Installation (2 minutes)

**Option A: Expo Go (Easiest)**
1. Install Expo Go from Google Play Store
2. Run `pnpm dev` on your computer
3. Scan the QR code with Expo Go
4. App loads instantly!

**Option B: APK (Production)**
1. Run `pnpm build:android`
2. Transfer the APK to your phone
3. Tap the APK to install
4. Grant permissions when prompted

### First Search (1 minute)

1. Open the Bing Rewards Automator app
2. Tap **PC Search** or **Mobile Search**
3. Tap **Start Manual (1)** to test
4. Or tap **Start Automatic** for daily quota

### Tips

- ⚙️ Tap **Settings** tab to configure your tier
- 📊 Watch points and search counters update
- 🔴 Tap **Stop** to pause anytime

---

## Common Settings

| Setting | Recommended Value | Why |
|---------|-------------------|-----|
| **Tier** | Gold | Highest daily quota (12 PC, 20 Mobile) |
| **Min Interval** | 15 seconds | Looks natural |
| **Max Interval** | 32 seconds | Randomized delays |
| **User-Agent Rotation** | Enabled | Avoids detection |
| **Localized Searches** | Enabled | Uses your location |
| **15-min Cooldown** | Disabled (optional) | Extra safety |

---

## Troubleshooting at a Glance

| Problem | Solution |
|---------|----------|
| Extension icon missing | Enable Developer mode in `edge://extensions/` |
| Searches not starting | Check you're logged into Bing.com |
| Points not increasing | Wait 1-2 minutes, then check Bing dashboard |
| App crashes | Clear app cache in Android Settings |
| No internet | Check WiFi/mobile data connection |

---

## ⚠️ Important Reminders

- **This violates Bing Rewards terms of service**
- **Your account may be suspended or banned**
- **Use at your own risk**
- **Keep anti-detection settings enabled**
- **Monitor your account regularly**

For detailed help, see the full [USER_MANUAL.md](USER_MANUAL.md)
*** Add File: /home/ubuntu/bing-rewards-mobile/TROUBLESHOOTING.md
# Bing Rewards Automator - Troubleshooting Guide

## Quick Diagnosis

### Is the tool running?

**Edge Extension:**
- Open the popup and check the status badge
- Look for "Searching..." or "Idle"

**Android App:**
- Check the status card on the home screen
- Look for "Searching..." or "Ready"

### Are searches happening?

**Edge Extension:**
- Check the activity log in the popup
- Look at your browser history (Ctrl+H)
- Check Bing.com for recent searches

**Android App:**
- Scroll down to see the activity log
- Check Bing.com for recent searches

### Are points being awarded?

1. Go to https://www.bing.com/rewards/dashboard
2. Check if your points increased
3. Wait 1-2 minutes and refresh

---

## Problem: Extension Won't Load

### Symptoms
- Extension icon doesn't appear in toolbar
- `edge://extensions/` shows error
- Extension appears but is disabled

### Solutions

**Step 1: Check Developer Mode**
1. Open `edge://extensions/`
2. Look for "Developer mode" toggle in bottom-left
3. If it's OFF (gray), click it to turn ON (blue)

**Step 2: Verify Extension is Enabled**
1. In `edge://extensions/`, find "Bing Rewards Automator"
2. Toggle the switch to ON (blue)
3. Refresh any open Bing.com tabs

**Step 3: Reload the Extension**
1. In `edge://extensions/`, find the extension
2. Click the refresh icon (circular arrow)
3. Wait 5 seconds and try again

**Step 4: Reinstall the Extension**
1. In `edge://extensions/`, find the extension
2. Click the trash icon to remove it
3. Close Edge completely
4. Reopen Edge and repeat the installation steps

---

## Problem: Searches Won't Start

### Symptoms
- Click "Start Automatic" or "Start Manual" but nothing happens
- Status stays "Idle"
- No searches appear in activity log

### Diagnosis Checklist

- [ ] Are you logged into Bing.com? (Check https://www.bing.com)
- [ ] Is your internet connection working? (Try visiting any website)
- [ ] Have you already completed your daily quota? (Check counter)
- [ ] Is the extension/app enabled?
- [ ] Are there any error messages?

### Solutions

**If not logged into Bing:**
1. Go to https://www.bing.com
2. Click "Sign in" in top-right
3. Enter your Microsoft account credentials
4. Return to the extension/app and try again

**If internet is down:**
1. Check WiFi or mobile data connection
2. Try visiting google.com to verify connectivity
3. Restart your router if needed
4. Try again once connected

**If daily quota is complete:**
1. Check the counter (e.g., "12/12")
2. Wait until tomorrow for the quota to reset
3. Or switch to a different mode (PC ↔ Mobile)

**If extension/app is disabled:**

**Edge:**
1. Open `edge://extensions/`
2. Find "Bing Rewards Automator"
3. Toggle the switch to ON

**Android:**
1. Go to Settings → Apps
2. Find "Bing Rewards Automator"
3. Tap "Permissions" and enable "Internet"

**If still not working:**
1. Try a manual search first (click "Start Manual (1)")
2. If manual works but automatic doesn't, restart the tool
3. If neither works, try reinstalling

---

## Problem: Points Not Increasing

### Symptoms
- Searches complete but points stay at 0
- Counter shows searches but no points
- Bing dashboard shows no new points

### Diagnosis

**Check 1: Are searches actually happening?**
1. Look at the activity log
2. Do you see search entries with timestamps?
3. If no, see "Problem: Searches Won't Start" above

**Check 2: Is your Bing account active?**
1. Go to https://www.bing.com/rewards/dashboard
2. Look for any warning messages
3. Check if your account shows "Active"

**Check 3: Are you logged into the correct account?**
1. Open https://www.bing.com
2. Click your profile icon (top-right)
3. Verify the email matches your Bing Rewards account

### Solutions

**Solution 1: Wait for Sync**
- Points may take 1-2 minutes to appear
- Refresh the Bing Rewards dashboard
- Wait 5 minutes and check again

**Solution 2: Perform a Manual Search**
1. Go to https://www.bing.com
2. Search for something (e.g., "weather")
3. Check if points are awarded
4. If yes, the account works; if no, see below

**Solution 3: Check Account Status**
1. Visit https://www.bing.com/rewards/dashboard
2. Look for any account warnings or restrictions
3. If restricted, you may need to contact Microsoft support

**Solution 4: Clear Browser Cache**

**Edge:**
1. Press Ctrl+Shift+Delete
2. Select "All time" for time range
3. Check "Cookies and other site data"
4. Click "Clear now"
5. Restart Edge and try again

**Solution 5: Verify Extension Permissions**
1. Open `edge://extensions/`
2. Find "Bing Rewards Automator"
3. Click "Details"
4. Under "Permissions", ensure it has access to bing.com
5. If not, click "Add" and select bing.com

---

## Problem: Android App Crashes

### Symptoms
- App closes unexpectedly
- "Unfortunately, Bing Rewards Automator has stopped" message
- App won't open at all

### Quick Fixes

**Fix 1: Clear App Cache**
1. Go to Settings → Apps
2. Find "Bing Rewards Automator"
3. Tap "Storage"
4. Tap "Clear Cache"
5. Reopen the app

**Fix 2: Force Stop and Restart**
1. Go to Settings → Apps
2. Find "Bing Rewards Automator"
3. Tap "Force Stop"
4. Wait 5 seconds
5. Tap the app icon to reopen

**Fix 3: Check Storage Space**
1. Go to Settings → Storage
2. Check if you have at least 100MB free
3. If not, delete unused apps or files
4. Try opening the app again

**Fix 4: Update Android**
1. Go to Settings → System
2. Tap "System update"
3. If an update is available, install it
4. Restart your device
5. Try the app again

**Fix 5: Reinstall the App**
1. Go to Settings → Apps
2. Find "Bing Rewards Automator"
3. Tap "Uninstall"
4. Confirm the uninstall
5. Reinstall the APK or use Expo Go

### If Still Crashing

1. Check if your Android version is 8.0 or higher
2. Try disabling Battery Saver mode
3. Ensure you have at least 500MB free storage
4. Report the issue on GitHub with your Android version

---

## Problem: Extension Popup Unresponsive

### Symptoms
- Popup won't open when clicking extension icon
- Buttons don't respond to clicks
- Status doesn't update

### Solutions

**Solution 1: Refresh the Popup**
1. Close the popup (click elsewhere)
2. Wait 3 seconds
3. Click the extension icon again

**Solution 2: Reload the Extension**
1. Open `edge://extensions/`
2. Find "Bing Rewards Automator"
3. Click the refresh icon
4. Try opening the popup again

**Solution 3: Restart Edge**
1. Close Microsoft Edge completely
2. Wait 5 seconds
3. Reopen Edge
4. Click the extension icon

**Solution 4: Check Service Worker**
1. Open `edge://extensions/`
2. Find "Bing Rewards Automator" and click "Details"
3. Look for "Service worker" status
4. If it says "Inactive", click "Inspect" to activate it

---

## Problem: High Battery Drain (Mobile)

### Symptoms
- Battery depletes quickly while using the app
- Phone gets hot during automation
- Battery percentage drops 1% per minute

### Solutions

**Solution 1: Reduce Screen Brightness**
1. Go to Settings → Display
2. Reduce brightness to 30-50%
3. Enable "Adaptive brightness"

**Solution 2: Enable Battery Saver**
1. Go to Settings → Battery
2. Enable "Battery Saver" or "Low Power Mode"
3. This may slow down searches but saves battery

**Solution 3: Close Background Apps**
1. Open Recent Apps (swipe up from bottom)
2. Swipe left/right on apps to close them
3. Keep only Bing Rewards Automator open

**Solution 4: Limit Automation**
1. Use "Start Manual (1)" instead of "Start Automatic"
2. Or run automation only once per day
3. Perform other searches manually

**Solution 5: Disable Unnecessary Features**
1. Go to Settings tab
2. Disable "Localized Searches" (if not needed)
3. Disable "User-Agent Rotation"
4. These reduce processing but may increase detection risk

---

## Problem: "Cannot Connect to Bing" Error

### Symptoms
- Error message appears in activity log
- Searches fail to complete
- Network error notifications

### Solutions

**Solution 1: Check Internet Connection**
1. Try visiting https://www.bing.com manually
2. If it loads, your connection is fine
3. If not, check WiFi/mobile data

**Solution 2: Check Bing Status**
1. Visit https://www.bing.com
2. If it's down, wait for it to come back online
3. Check Twitter @Bing for status updates

**Solution 3: Disable VPN (if using)**
1. If you're using a VPN, try disabling it
2. Some VPNs block Bing
3. Try again without VPN

**Solution 4: Clear DNS Cache**

**Windows:**
1. Open Command Prompt (Win+R, type "cmd")
2. Type: `ipconfig /flushdns`
3. Press Enter
4. Restart Edge and try again

**Mac:**
1. Open Terminal
2. Type: `sudo dscacheutil -flushcache`
3. Enter your password
4. Restart Edge and try again

**Android:**
1. Go to Settings → Apps
2. Find "Bing Rewards Automator"
3. Tap "Storage" → "Clear Cache"
4. Try again

---

## Problem: Account Restriction Warning

### Symptoms
- Message on Bing Rewards dashboard: "Your account has been restricted"
- Searches no longer award points
- Unable to redeem rewards

### Immediate Actions

1. **Stop Using the Tool Immediately**
   - Uninstall the extension
   - Delete the mobile app
   - Do not attempt further automation

2. **Contact Microsoft Support**
   - Go to https://support.microsoft.com/en-us/account-billing
   - Describe the issue
   - Be honest about using an automated tool

3. **Request Account Review**
   - Ask Microsoft to review your account
   - Explain that you understand the terms violation
   - Request reinstatement

4. **Wait for Response**
   - Microsoft typically responds within 1-2 weeks
   - Check your email for updates
   - Be patient

### Prevention for Future

If your account is reinstated:
- Use the tool more conservatively (once per day only)
- Enable the 15-minute cooldown option
- Perform some searches manually
- Monitor your account weekly
- Consider not using the tool at all

---

## Still Having Issues?

### Report a Bug

1. Go to https://github.com/jondrippa/bing-search-automator
2. Click "Issues"
3. Click "New Issue"
4. Describe your problem in detail
5. Include:
   - Your OS (Windows/Mac/Android)
   - Browser/app version
   - Steps to reproduce
   - Screenshots if possible

### Get Help

- Check the full [USER_MANUAL.md](USER_MANUAL.md)
- Review the [QUICK_START.md](QUICK_START.md)
- Search existing GitHub issues
- Contact Microsoft Rewards support for account issues

---

**Last Updated**: July 2026
