## Mobile App Interface Design: Bing Rewards Automator

This document outlines the interface design for the Bing Rewards Automator mobile application, focusing on a light theme, one-handed usage, and adherence to Apple Human Interface Guidelines (HIG) for a native iOS feel, while also being functional on Android.

### 1. Screen List

*   **Home Screen (Dashboard)**: Primary screen displaying current status, controls, and counters.
*   **Settings Screen**: Allows users to configure automation parameters, Bing account details (if needed), and other app preferences.
*   **About/Help Screen**: Provides information about the app, usage instructions, and troubleshooting tips.

### 2. Primary Content and Functionality

#### Home Screen (Dashboard)

*   **Current Status Display**: Clearly indicates if automation is running, paused, or stopped.
*   **Points Counter**: Displays current Bing Rewards points earned for desktop and mobile searches.
*   **Search Counter**: Shows the number of searches completed out of the daily maximum for both desktop and mobile.
*   **Mode Selector**: A toggle or segmented control to switch between "Desktop Search" and "Mobile Search" modes.
*   **Control Buttons**: "Start Automatic Search", "Start Manual Search", "Pause", "Stop".
*   **Recent Search History/Log**: A scrollable list showing the last few searches performed and their status.

#### Settings Screen

*   **Automation Settings**: Adjustable parameters like search interval, cooldowns, and tier selection (member, silver, gold, legacy).
*   **Localization Settings**: Option to enable/disable localized trending searches and potentially manually set a preferred location.
*   **Anti-Detection Settings**: (Advanced) Options to fine-tune user-agent, referrer, or other anti-detection parameters.
*   **Notification Settings**: Enable/disable notifications for task completion or errors.
*   **Theme**: Option to switch between light/dark mode (though light theme is prioritized).

#### About/Help Screen

*   App version, author information.
*   Link to privacy policy and terms of service.
*   FAQ or basic troubleshooting.

### 3. Key User Flows

*   **Initial Setup**: User opens app → Home Screen (displays initial status) → (Optional) Navigates to Settings to configure.
*   **Start Automatic Search**: User taps "Start Automatic Search" → App begins performing searches in the background → Home Screen updates counters and status in real-time.
*   **Start Manual Search**: User taps "Start Manual Search" → App performs one search → Home Screen updates counters and status.
*   **Pause/Stop Search**: User taps "Pause" or "Stop" → Automation halts → Status updates.
*   **View Progress**: User views Home Screen to see points and search counters.
*   **Adjust Settings**: User navigates to Settings → Modifies parameters → Saves changes.

### 4. Color Choices (Light Theme Prioritized)

The app will primarily use a light theme, with a clean and modern aesthetic. Colors will be chosen to align with Microsoft
