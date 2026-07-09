# Bing Rewards Automator

A powerful React Native mobile application built with Expo that automates and optimizes your Bing Rewards earnings. Earn points effortlessly with intelligent automation, real-time analytics, and push notifications.

## 🎯 Features

### Core Functionality
- **Automated Searches**: Automatically perform Bing searches to earn points
- **Quiz & Survey Automation**: Complete daily quizzes and surveys automatically
- **Real-time Analytics**: Track your earnings with detailed performance metrics
- **Opportunity Tracking**: Discover and track high-value earning opportunities
- **Account Health Monitoring**: Monitor your account status and receive alerts

### Advanced Features
- **Microsoft OAuth Integration**: Secure connection to your Microsoft account
- **Background Sync**: Automatic data synchronization even when app is closed
- **Push Notifications**: Get alerts for new opportunities and milestones
- **Time-based Analytics**: View earnings trends over 7, 30, or 90 days
- **Growth Analysis**: Track your earning growth rate and efficiency
- **Category Breakdown**: See which earning categories generate the most points

### User Experience
- **Accessible Design**: Large touch targets and readable fonts for all ages
- **Dark/Light Theme Support**: Automatic theme switching based on system settings
- **Loading States**: Professional skeleton loaders during data fetching
- **Error Handling**: Graceful error states with retry functionality
- **Responsive Layout**: Optimized for phones, tablets, and web browsers

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Microsoft Account (for Bing Rewards)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bing-rewards-automator.git
   cd bing-rewards-automator
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Run on your device**
   - **iOS**: Press `i` in the terminal or run `pnpm ios`
   - **Android**: Press `a` in the terminal or run `pnpm android`
   - **Web**: Press `w` in the terminal or navigate to the provided URL

## 📱 Screens Overview

### Home Screen
The main dashboard showing your current points, account health status, and quick access to earning methods.

**Features:**
- Account health indicator with score
- Current points and searches count
- Quick action buttons for PC and mobile searches
- Navigation tabs for all features

### Stats Screen
Comprehensive analytics dashboard with detailed performance metrics and trends.

**Features:**
- Total points and searches earned
- Average points per day
- Daily breakdown table
- Points trend chart (7-day view)
- Efficiency analysis
- Best and worst performing days
- Personalized insights

### Earn Screen
Browse and track available earning opportunities from Bing Rewards.

**Features:**
- List of available opportunities
- Category filtering (quizzes, surveys, shopping, Xbox)
- Priority indicators
- Estimated completion time
- Points value display
- Completion status tracking

### Automation Screen
Configure and manage automated earning tasks.

**Features:**
- Toggle automation features on/off
- Configure search frequency
- Set quiz automation preferences
- Enable/disable survey automation
- Schedule automation times
- View automation status

### Profile Screen
Manage your account and preferences.

**Features:**
- User profile information
- Microsoft account connection/disconnection
- Notification preferences
- Account settings
- Privacy and security options

### Analytics Screen
Advanced analytics with time-range filtering and trend analysis.

**Features:**
- 7/30/90 day view selector
- Key performance metrics
- Growth rate analysis
- Category breakdown with percentages
- Performance recommendations
- Best and worst day analysis

## 🔧 Technology Stack

- **Frontend**: React Native with Expo SDK 54
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context + TanStack Query
- **Backend**: Node.js with tRPC
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Microsoft OAuth 2.0
- **Notifications**: Expo Notifications
- **Background Tasks**: Expo Background Fetch & Task Manager
- **Type Safety**: TypeScript 5.9

## 📊 API Integration

### Bing Rewards API
The app integrates with Microsoft's Bing Rewards API to fetch:
- User profile and account information
- Current points and search metrics
- Available opportunities
- Daily statistics and trends
- Account health status

### tRPC Endpoints

**Metrics**
```typescript
metrics.getMetrics()           // Get current user metrics
metrics.getDailyStats(dates)   // Get historical daily stats
```

**Opportunities**
```typescript
opportunities.getOpportunities()      // Get available opportunities
opportunities.createOpportunity(data) // Create/track opportunity
opportunities.completeOpportunity(id) // Mark opportunity complete
```

## 🔐 Security & Privacy

### Account Safety
- Uses official Microsoft OAuth 2.0 authentication
- Tokens stored securely in device keychain
- No credentials stored locally
- Automatic token refresh
- Session timeout protection

### Data Privacy
- All data encrypted in transit (HTTPS)
- Database connections use SSL
- User data never shared with third parties
- GDPR compliant data handling
- Local data can be cleared anytime

### Best Practices
- Searches based on local trending topics
- IP address-based search variation
- Randomized search patterns to avoid detection
- Account health monitoring
- Automatic alerts for suspicious activity

## 📲 Installation Guides

### iOS Installation

1. **Using Expo Go (Easiest)**
   - Download Expo Go from App Store
   - Scan the QR code from `pnpm dev`
   - App loads instantly

2. **Building Native App**
   ```bash
   eas build --platform ios
   ```

### Android Installation

1. **Using Expo Go**
   - Download Expo Go from Google Play
   - Scan the QR code from `pnpm dev`
   - App loads instantly

2. **Building APK**
   ```bash
   eas build --platform android --type apk
   ```

3. **Building AAB (for Play Store)**
   ```bash
   eas build --platform android
   ```

### Web Installation

1. **Local Development**
   ```bash
   pnpm dev
   # Navigate to http://localhost:8081
   ```

2. **Production Build**
   ```bash
   pnpm build
   ```

## 🎮 Usage Guide

### First Time Setup

1. **Launch the app** and create or sign in with your Microsoft account
2. **Grant permissions** for notifications and background tasks
3. **Configure automation** preferences in the Automation screen
4. **Enable background sync** for automatic updates

### Daily Usage

1. **Check Home screen** for current points and account status
2. **View Earn screen** to complete available opportunities
3. **Monitor Stats screen** to track your progress
4. **Check Profile** for account settings and preferences

### Maximizing Earnings

1. **Complete daily quizzes** - Usually 10-50 points each
2. **Participate in surveys** - 5-100 points depending on length
3. **Use shopping rewards** - Earn points on purchases
4. **Enable automation** - Let the app work while you sleep
5. **Monitor trends** - Check Analytics to identify best earning times

## 🐛 Troubleshooting

### App Won't Start
- Clear app cache: Settings → Apps → Bing Rewards → Clear Cache
- Reinstall the app
- Check internet connection

### Notifications Not Working
- Enable notifications in Settings → Notifications
- Check notification permissions
- Restart the app

### Sync Not Working
- Check internet connection
- Verify Microsoft account is connected
- Check background app refresh is enabled
- Restart the app

### Low Earnings
- Check account health status
- Verify automation is enabled
- Review Analytics for patterns
- Check for account restrictions

## 📚 Documentation

- **[User Guide](./docs/USER_GUIDE.md)** - Detailed user instructions
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Development setup and architecture
- **[API Documentation](./docs/API.md)** - API endpoints and usage
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. **Create a new branch** for your feature
2. **Write tests** for new functionality
3. **Run tests** to ensure everything passes: `pnpm test`
4. **Check types** with TypeScript: `pnpm check`
5. **Format code** with Prettier: `pnpm format`
6. **Submit a PR** with clear description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is provided as-is for educational purposes. Users are responsible for:
- Complying with Microsoft's Terms of Service
- Following all Bing Rewards program rules
- Using the automation features responsibly
- Monitoring their account for any issues

The developers are not responsible for account bans, suspensions, or loss of points due to misuse of this application.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Styled with [NativeWind](https://www.nativewind.dev/)
- Backend powered by [tRPC](https://trpc.io/)
- Database managed with [Drizzle ORM](https://orm.drizzle.team/)

## 📞 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/bing-rewards-automator/issues)
- **Discussions**: Ask questions on [GitHub Discussions](https://github.com/yourusername/bing-rewards-automator/discussions)
- **Email**: support@example.com

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core features
- UI/UX redesign for accessibility
- Real data fetching integration
- Push notifications system
- Advanced analytics dashboard
- Background sync functionality

---

**Happy Earning! 🎉**

For the latest updates and features, visit our [GitHub repository](https://github.com/yourusername/bing-rewards-automator).
