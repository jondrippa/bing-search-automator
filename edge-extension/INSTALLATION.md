# Edge Extension Installation Guide

This guide explains how to install the Bing Rewards Automator Edge extension on your browser.

## Prerequisites

- Microsoft Edge browser (latest version)
- Administrator access to install extensions
- The extension source files

## Installation Steps

### Step 1: Extract the Extension Files

1. Download the `bing-search-automator-main.zip` from GitHub
2. Extract it to a folder on your computer
3. Navigate to the `edge-extension` folder

### Step 2: Enable Developer Mode in Edge

1. Open Microsoft Edge
2. Go to `edge://extensions/`
3. Toggle **"Developer mode"** in the bottom-left corner
4. The toggle should turn blue when enabled

### Step 3: Load the Extension

1. Click **"Load unpacked"** button (appears after enabling Developer mode)
2. Navigate to the `edge-extension` folder you extracted
3. Select the folder and click **"Select Folder"**
4. The extension should now appear in your extensions list

### Step 4: Verify Installation

1. You should see "Bing Rewards Automator" in your extensions list
2. Click the extension icon in the toolbar to open the popup
3. You should see the automation controls

## Troubleshooting

### "Manifest file is missing or unreadable" Error

**Solution:**
1. Ensure you're selecting the correct folder (the one containing `manifest.json`)
2. Verify `manifest.json` is in the root of the `edge-extension` folder
3. Check that the file is not corrupted:
   - Open `manifest.json` in a text editor
   - Verify it contains valid JSON (no syntax errors)
   - Save the file and try loading again

### Extension Doesn't Appear

**Solution:**
1. Refresh the extensions page (`edge://extensions/`)
2. Verify Developer mode is still enabled
3. Try removing and reloading the extension
4. Check the browser console for errors (F12)

### Icons Not Showing

**Solution:**
1. The extension will work without icons, but for better appearance:
2. Ensure the `assets` folder exists in the `edge-extension` directory
3. Place icon files in the `assets` folder:
   - `icon-16.png` (16x16 pixels)
   - `icon-48.png` (48x48 pixels)
   - `icon-128.png` (128x128 pixels)
4. Reload the extension

## File Structure

The extension should have this structure:

```
edge-extension/
├── manifest.json          (Required - extension configuration)
├── src/
│   ├── popup.html        (Extension popup UI)
│   ├── popup.js          (Popup logic)
│   ├── popup.css         (Popup styling)
│   ├── options.html      (Settings page)
│   ├── options.js        (Settings logic)
│   ├── options.css       (Settings styling)
│   ├── service-worker.js (Background worker)
│   ├── content-script.js (Page content script)
│   ├── auth-service.js   (Authentication)
│   ├── sync-manager.js   (Data sync)
│   └── opportunities-detector.js (Opportunity detection)
└── assets/               (Optional - extension icons)
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## Using the Extension

### Popup Controls

1. **Enable/Disable Automation** - Toggle to turn automation on/off
2. **Search Mode** - Select between Desktop, Mobile, or Both
3. **Automation Status** - Shows current automation state
4. **Points Display** - Shows current Bing Rewards points
5. **Search Counter** - Shows number of searches completed

### Options Page

1. Click the extension icon and select "Options"
2. Configure:
   - Automation schedule
   - Search preferences
   - Notification settings
   - Sync interval

### Keyboard Shortcuts

- **Ctrl+Shift+B** - Toggle automation on/off
- **Ctrl+Shift+S** - Open extension popup

## Features

✅ **Automated Searches** - Automatically performs Bing searches
✅ **Manual Controls** - Override automation anytime
✅ **Anti-Detection** - Uses realistic search patterns
✅ **Real-time Sync** - Syncs with mobile app
✅ **Account Safety** - Monitors account health
✅ **Opportunity Detection** - Alerts for high-value opportunities

## Uninstalling

1. Go to `edge://extensions/`
2. Find "Bing Rewards Automator"
3. Click the trash icon to remove
4. Confirm the removal

## Support

For issues or questions:

1. Check the TROUBLESHOOTING.md file
2. Review the README.md in the edge-extension folder
3. Check GitHub Issues: https://github.com/jondrippa/bing-search-automator/issues

## Important Notes

- The extension requires access to Bing.com to function
- Ensure you're logged into your Bing Rewards account
- The extension respects your privacy and doesn't collect personal data
- All data is stored locally on your device
- The extension is optimized to avoid account bans

## Next Steps

1. Open the extension popup to verify it's working
2. Configure your preferences in the Options page
3. Enable automation to start earning rewards
4. Monitor your progress in the mobile app

---

**Happy earning!** 🎉
