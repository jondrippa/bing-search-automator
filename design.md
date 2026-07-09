# Mobile App Interface Design: Bing Rewards Automator

This document outlines the interface design for the Bing Rewards Automator mobile application, focusing on a light theme, one-handed usage, and adherence to Apple Human Interface Guidelines (HIG) for a native iOS feel, while also being functional on Android. The primary goal is to ensure an accessible and smooth user experience for a wide age range (10 to 80 years old).

## General Design Principles

*   **Clarity and Readability**: Prioritize clear, legible text with sufficient contrast. Use larger font sizes (e.g., `text-base`, `text-lg`, `text-xl`) and generous line spacing to improve readability. Avoid small, cramped text.
*   **Simplicity**: Minimize visual clutter and present information in a straightforward manner. Avoid complex layouts or excessive animations. Each screen should have a clear purpose and primary action.
*   **Touch Target Size**: Ensure all interactive elements (buttons, switches, list items) have large, easily tappable areas (minimum 44x44 points) to prevent accidental presses and improve usability for all users.
*   **Consistent Navigation**: Maintain a consistent navigation pattern across all screens to reduce cognitive load. Tab bar icons should be clear and easily recognizable.
*   **Feedback**: Provide clear visual and haptic feedback for user interactions (e.g., button presses, toggle changes, successful actions).
*   **Spacing and Padding**: Utilize ample padding and margins (e.g., `p-4`, `p-6`, `mb-4`, `gap-3`) to create visual breathing room between elements and prevent a cramped appearance, especially on smaller screens.
*   **Mobile Portrait Orientation (9:16)**: All designs are optimized for standard mobile portrait view.
*   **One-Handed Usage**: Key interactive elements are generally placed within easy reach for one-handed operation.
*   **iOS Mainstream Design**: Adhere to Apple Human Interface Guidelines (HIG) for a native iOS feel, while ensuring cross-platform compatibility and a good experience on Android.

## Screen List and Design Details

### 1. Home Screen (index.tsx)

*   **Primary Content and Functionality**: Displays a welcome message, a brief explanation of the app, and a call to action. The layout should be simple, with a clear hero section and a prominent 
call to action. The layout should be simple, with a clear hero section and a prominent button for the main action.

### 2. Earn Screen (opportunities.tsx)

*   **Primary Content and Functionality**: Displays various opportunities to earn points (quizzes, surveys, daily sets, etc.). Each opportunity should be presented as a distinct, easily tappable card or list item with clear titles, descriptions, and point values. Use large, clear icons.
*   **Layout**: Use a `FlatList` or `ScrollView` with well-spaced items. Each item should have sufficient padding and margin to avoid feeling cramped. The main action button for each opportunity should be prominent.

### 3. Automation Screen (automation.tsx)

*   **Primary Content and Functionality**: Manages automated activities. This screen includes toggles for different activity types, a status display, and action buttons (Start/Stop Automation). The activity log should be easy to read.
*   **Layout**: Use clear sections for status, action buttons, configuration toggles, and activity logs. Toggles should be large and responsive. The activity log items should have increased padding and larger text for better readability, with clear status indicators.

### 4. Sync Screen (sync.tsx)

*   **Primary Content and Functionality**: Displays synchronization status, current data (points, searches), export options, and sync interval settings. This screen is critical for users to understand their data and control syncing behavior.
*   **Layout**: Use distinct cards for each section (Sync Status, Current Data, Force Sync, Export Options, Sync Interval, Sync History). Each card should have generous padding. Text sizes for data points and labels should be increased for readability. Buttons for export and sync interval selection should be large and clearly labeled.

### 5. Color Choices (Light Theme Prioritized)

The app will primarily use a light theme, with a clean and modern aesthetic. Colors will be chosen to align with Microsoft's brand guidelines where appropriate, ensuring high contrast for text and interactive elements.

*   **Primary Accent**: A vibrant but not overwhelming blue (e.g., `#0a7ea4`) for primary actions, highlights, and active states.
*   **Background**: A clean white (`#ffffff`) for main screen backgrounds.
*   **Surface**: A light grey (`#f5f5f5`) for cards and elevated elements to provide subtle visual separation.
*   **Text**: Dark grey/black (`#11181C`) for primary text, and a medium grey (`#687076`) for muted/secondary text.
*   **Status Indicators**: Green for success (`#22C55E`), yellow for warning (`#F59E0B`), and red for error (`#EF4444`).

## Key User Flows (Updated for Accessibility)

*   **Initial Setup**: User opens app → Home Screen (displays initial status) → (Optional) Navigates to Settings to configure. Clear onboarding messages will guide new users.
*   **Start Automation**: User taps large "Start Full Automation" button on the Automation screen → App begins performing activities in the background → Status updates prominently on the Automation screen.
*   **View Progress**: User navigates to the Sync screen to see points, search counters, and account health. Data is presented in large, easy-to-read numbers.
*   **Adjust Settings**: User navigates to Settings → Modifies parameters using large toggles and clearly labeled options → Changes are saved automatically or with a prominent save button.
*   **Export Data**: User selects an export option on the Sync screen → Clear feedback (e.g., "Exporting...") is provided → Confirmation message appears upon completion.
