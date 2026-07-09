# Edge Extension Cache Troubleshooting

If you're seeing old error messages after updating the extension, Edge is likely caching the old code. Follow these steps to clear the cache and reload the updated extension.

## Quick Fix (Recommended)

### Step 1: Remove the Extension

1. Open Microsoft Edge
2. Go to `edge://extensions/`
3. Find "Bing Rewards Automator"
4. Click the **trash icon** to remove it
5. Confirm the removal

### Step 2: Download Updated Code

1. Go to https://github.com/jondrippa/bing-search-automator
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file to a new location

### Step 3: Reload the Extension

1. Go back to `edge://extensions/`
2. Verify "Developer mode" is still enabled
3. Click "Load unpacked"
4. Navigate to the extracted folder → `edge-extension` folder
5. Click "Select Folder"

### Step 4: Verify the Fix

1. Click the extension icon in the toolbar
2. Open the browser console (F12)
3. You should NOT see any localStorage errors
4. The extension should work without errors

## Alternative: Manual Cache Clear

If the quick fix doesn't work:

### Step 1: Clear Extension Data

1. Go to `edge://extensions/`
2. Click on "Bing Rewards Automator"
3. Scroll down to "Storage"
4. Click "Clear data"
5. Confirm the action

### Step 2: Reload Extension

1. Go back to `edge://extensions/`
2. Click the refresh icon on the "Bing Rewards Automator" card
3. Wait for the extension to reload

### Step 3: Test Again

1. Open the extension popup
2. Check the browser console (F12) for errors
3. The error should be gone

## Deep Clean (Nuclear Option)

If you're still having issues:

### Step 1: Completely Remove Extension

1. Go to `edge://extensions/`
2. Remove "Bing Rewards Automator"
3. Close Edge completely
4. Reopen Edge

### Step 2: Clear Browser Cache

1. Press `Ctrl+Shift+Delete` to open Clear Browsing Data
2. Select "All time" for time range
3. Check:
   - ☑ Cookies and other site data
   - ☑ Cached images and files
4. Click "Clear now"

### Step 3: Reload Extension

1. Go to `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `edge-extension` folder
5. Wait for it to fully load

## Verify the Fix

### Check Console for Errors

1. Click the extension icon
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. You should see NO errors
5. Look for messages like:
   - ✅ "Sync manager initialized"
   - ✅ "Extension loaded successfully"

### Test Extension Features

1. **Open Popup** - Click extension icon, popup should appear
2. **Check Storage** - Go to `edge://extensions/` → "Bing Rewards Automator" → "Storage" → "Local Storage"
3. **Verify Data** - Should show extension data without errors

## What Changed

The latest update fixed:
- ❌ **Old**: Used `localStorage` (not supported in service workers)
- ✅ **New**: Uses `chrome.storage.local` (proper Chrome API)

This is why you need to reload the extension - the old code is cached and needs to be replaced with the new version.

## Still Having Issues?

If you're still seeing errors after following these steps:

1. **Check the file path** - Ensure you're loading from the correct `edge-extension` folder
2. **Verify manifest.json** - Open the manifest.json file and verify it's valid JSON
3. **Check browser console** - Look for specific error messages
4. **Try a different folder** - Extract the ZIP again to a different location and try loading from there

## Files That Were Updated

The following files were fixed in the latest update:
- ✅ `edge-extension/src/sync-manager.js` - Now uses Chrome Storage API
- ✅ `edge-extension/manifest.json` - Includes proper icon references
- ✅ `edge-extension/INSTALLATION.md` - Updated installation guide

## Prevention

To avoid cache issues in the future:

1. **Always remove the extension before updating** - Don't just reload
2. **Use "Clear data" option** - Clear extension storage before reloading
3. **Hard refresh** - Press Ctrl+Shift+R in the extension popup to force refresh
4. **Check version** - Verify you have the latest code from GitHub

---

**The extension should now work perfectly!** 🎉

If you continue to have issues, please:
1. Take a screenshot of the error
2. Note the exact error message
3. Check the browser console (F12) for additional details
4. Report the issue on GitHub
