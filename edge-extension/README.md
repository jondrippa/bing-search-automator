# Bing Rewards Automator - Microsoft Edge Extension

This is a Manifest V3 compliant Microsoft Edge extension for automating Bing Rewards searches with built-in anti-detection measures.

## Features

*   **Manual and Automatic Search Modes**: Start a single search or run automated searches for the day.
*   **Anti-Detection Measures**: Randomized delays, user-agent rotation, localized searches, and human-like scrolling.
*   **Light Theme UI**: Clean, intuitive popup interface with status, counters, and controls.
*   **Tier Support**: Supports Member, Silver, Gold, and Legacy Bing Rewards tiers.
*   **IP-Based Localization**: Fetches local trending searches based on your IP address.
*   **Settings Page**: Configure search intervals, cooldowns, and anti-detection options.

## Installation

1.  Clone or download this repository.
2.  Open Microsoft Edge and navigate to `edge://extensions/`.
3.  Enable "Developer mode" (toggle in the top-right corner).
4.  Click "Load unpacked" and select the `edge-extension` folder.
5.  The extension should now appear in your extensions list.

## Usage

1.  Click the extension icon in the toolbar to open the popup.
2.  Select "PC Search" or "Mobile Search" mode.
3.  Click "Start Automatic" to run automated searches or "Start Manual (1)" for a single search.
4.  Monitor progress via the status and counters.
5.  Click "Settings" to adjust automation parameters.

## Anti-Detection Strategy

*   **Variable Delays**: Searches are spaced with random intervals to mimic human behavior.
*   **User-Agent Rotation**: Each search may use a different user-agent string.
*   **Localized Searches**: Keywords are fetched based on your IP location for natural-looking queries.
*   **Human-like Scrolling**: The content script simulates scrolling on search results pages.
*   **Cooldown Periods**: Optional 15-minute cooldowns after every 3 searches for added safety.

## Important Notes

⚠️ **Account Safety**: This extension is designed to minimize the risk of account bans, but use it responsibly. Bing Rewards terms of service prohibit automated searching. Use at your own risk.

⚠️ **Manifest V3**: This extension uses Manifest V3, which is the current standard for Microsoft Edge and Chrome extensions.

## File Structure

```
nedge-extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── service-worker.js  # Background service worker (core logic)
│   ├── content-script.js  # Content script (page interaction)
│   ├── popup.html         # Popup UI
│   ├── popup.js           # Popup logic
│   ├── popup.css          # Popup styling
│   ├── options.html       # Settings page
│   ├── options.js         # Settings logic
│   └── options.css        # Settings styling
├── assets/                # Icons (to be added)
└── README.md              # This file
```

## License

MIT License - See LICENSE file for details.
