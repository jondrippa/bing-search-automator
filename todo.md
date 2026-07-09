# Project TODO

## Microsoft Edge Extension

- [ ] Implement Manifest V3 service worker for background tasks.
- [ ] Adapt original script logic for Manifest V3 compatibility.
- [ ] Create extension popup UI with status, counters, and controls.
- [ ] Implement anti-detection measures (variable delays, user-agent spoofing, referrer control).
- [ ] Integrate localized trending searches.
- [ ] Implement manual and automatic search modes.
- [ ] Develop settings page for configuration.
- [ ] Optimize file according to MS Edge manifest to avoid detection and account ban.

## Android Mobile App

- [ ] Set up basic Expo React Native project structure.
- [ ] Design and implement Home Screen (Dashboard) with status, counters, and controls.
- [ ] Implement manual and automatic search functionality.
- [ ] Integrate localized trending searches.
- [ ] Implement anti-detection measures for mobile (similar to extension, adapted for mobile context).
- [ ] Create Settings Screen for configuration.
- [ ] Implement light theme UI.
- [ ] Display points and search counters.
- [ ] Ensure app prioritizes not to ban account use.
- [ ] Base searches on IP address and local trending searches.

## General

- [ ] Refine UI/UX for both platforms based on design documents.
- [ ] Conduct thorough testing for functionality and anti-detection.
- [ ] Prepare documentation for both the extension and the app.
- [x] Generate custom app icon and update `app.config.ts`.
# Project TODO

## Microsoft Edge Extension

- [x] Implement Manifest V3 service worker for background tasks.
- [x] Adapt original script logic for Manifest V3 compatibility.
- [x] Create extension popup UI with status, counters, and controls.
- [x] Implement anti-detection measures (variable delays, user-agent spoofing, referrer control).
- [x] Integrate localized trending searches.
- [x] Implement manual and automatic search modes.
- [x] Develop settings page for configuration.
- [x] Optimize file according to MS Edge manifest to avoid detection and account ban.

## Android Mobile App

- [x] Set up basic Expo React Native project structure.
- [x] Design and implement Home Screen (Dashboard) with status, counters, and controls.
- [x] Implement manual and automatic search functionality.
- [x] Integrate localized trending searches (via IP-based API).
- [x] Implement anti-detection measures for mobile (variable delays, randomized keywords).
- [x] Create Settings Screen for configuration.
- [x] Implement light theme UI.
- [x] Display points and search counters.
- [x] Ensure app prioritizes not to ban account use.
- [x] Base searches on IP address and local trending searches.

## General

- [x] Refine UI/UX for both platforms based on design documents.
- [x] Prepare documentation for both the extension and the app.
- [x] Generate custom app icon and update `app.config.ts`.
- [ ] Conduct thorough testing for functionality and anti-detection.

# UI/UX Improvements

- [x] Redesign Earn screen (opportunities.tsx) for improved accessibility and user experience.
- [x] Redesign Automation screen (automation.tsx) for improved accessibility and user experience.
- [x] Redesign Sync screen (sync.tsx) for improved accessibility and user experience.
- [x] Redesign Stats screen (stats.tsx) for improved accessibility and user experience.
- [x] Implement larger font sizes and increased padding across all screens as per design.md.
- [x] Ensure all interactive elements have large, easily tappable areas.
- [x] Verify consistent navigation and clear feedback for user interactions.
- [x] Review and adjust color contrast for optimal readability.
- [x] Test on various Android devices to ensure proper rendering and address any cramping issues.


# Data Fetching and Authentication

- [x] Set up API routes for fetching user metrics (points, searches, opportunities).
- [x] Implement data fetching hooks for Stats screen.
- [ ] Implement data fetching hooks for Earn screen.
- [x] Implement user authentication system (login/logout).
- [ ] Add user profile management.
- [x] Replace mock data in Stats screen with real data.
- [ ] Replace mock data in Earn screen with real data.
- [ ] Test data fetching and authentication flows.
