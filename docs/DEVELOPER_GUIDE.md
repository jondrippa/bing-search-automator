# Bing Rewards Automator - Developer Guide

This guide covers the technical architecture, setup, and development workflow for the Bing Rewards Automator application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Key Technologies](#key-technologies)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Deployment](#deployment)

## Architecture Overview

The Bing Rewards Automator follows a modern mobile-first architecture with the following layers:

### Presentation Layer
- React Native components with Expo
- NativeWind for styling (Tailwind CSS)
- React Context for state management
- TanStack Query for server state

### Business Logic Layer
- Custom hooks for feature logic
- Service classes for API communication
- Background task handlers
- Notification managers

### Data Access Layer
- tRPC for type-safe API communication
- Drizzle ORM for database queries
- Microsoft OAuth for authentication
- Bing Rewards API client

### Infrastructure Layer
- Node.js backend server
- PostgreSQL database
- Background sync and notifications
- File storage with S3

## Project Structure

```
bing-rewards-mobile/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx             # Home screen
│   │   ├── stats.tsx             # Analytics screen
│   │   ├── opportunities.tsx      # Earn screen
│   │   ├── automation.tsx         # Automation screen
│   │   ├── profile.tsx            # Profile screen
│   │   ├── analytics.tsx          # Advanced analytics
│   │   └── _layout.tsx            # Tab navigation layout
│   ├── _layout.tsx                # Root layout with providers
│   └── oauth/                     # OAuth callbacks
├── components/                    # Reusable React components
│   ├── screen-container.tsx       # Safe area wrapper
│   ├── skeleton-loader.tsx        # Loading skeletons
│   ├── error-state.tsx            # Error display
│   └── ui/                        # UI components
├── hooks/                         # Custom React hooks
│   ├── use-auth.ts                # Authentication hook
│   ├── use-colors.ts              # Theme colors hook
│   ├── use-opportunities.ts        # Opportunities data hook
│   └── use-color-scheme.ts         # Dark/light mode
├── lib/                           # Utility libraries
│   ├── bing-rewards-client.ts     # Bing API client
│   ├── microsoft-oauth.ts         # Microsoft OAuth service
│   ├── background-sync.ts         # Background sync logic
│   ├── push-notifications.ts      # Notifications service
│   ├── trpc.ts                    # tRPC client setup
│   └── utils.ts                   # Utility functions
├── server/                        # Backend server
│   ├── _core/                     # Core server logic
│   │   ├── index.ts               # Server entry point
│   │   ├── trpc.ts                # tRPC setup
│   │   ├── oauth.ts               # OAuth handling
│   │   └── context.ts             # Request context
│   ├── routers.ts                 # API route definitions
│   ├── db.ts                      # Database helpers
│   └── README.md                  # Backend documentation
├── drizzle/                       # Database migrations
│   ├── schema.ts                  # Database schema
│   └── migrations/                # Migration files
├── constants/                     # App constants
├── assets/                        # Images and icons
├── tests/                         # Test files
├── docs/                          # Documentation
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── tailwind.config.js             # Tailwind configuration
```

## Development Setup

### Prerequisites

- Node.js 18+ with npm or pnpm
- Expo CLI: `npm install -g expo-cli`
- Git for version control
- A code editor (VS Code recommended)

### Initial Setup

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

4. **Set up database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

### Available Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server and Metro bundler |
| `pnpm dev:metro` | Start Metro bundler only |
| `pnpm dev:server` | Start backend server only |
| `pnpm ios` | Run on iOS simulator |
| `pnpm android` | Run on Android emulator |
| `pnpm web` | Run web version |
| `pnpm test` | Run test suite |
| `pnpm check` | Type check with TypeScript |
| `pnpm lint` | Lint code |
| `pnpm format` | Format code with Prettier |
| `pnpm build` | Build for production |
| `pnpm db:push` | Apply database migrations |

## Key Technologies

### Frontend
- **React Native 0.81**: Cross-platform mobile development
- **Expo SDK 54**: Development platform and services
- **Expo Router 6**: File-based routing
- **NativeWind 4**: Tailwind CSS for React Native
- **TanStack Query**: Server state management
- **React Context**: Local state management

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework
- **tRPC**: Type-safe RPC framework
- **Drizzle ORM**: Type-safe database queries
- **PostgreSQL**: Relational database

### Services
- **Microsoft OAuth 2.0**: User authentication
- **Expo Notifications**: Push notifications
- **Expo Background Fetch**: Background tasks
- **AWS S3**: File storage

## API Documentation

### tRPC Endpoints

#### Metrics Router

```typescript
// Get current user metrics
metrics.getMetrics()
// Returns: { totalPoints, currentPoints, todayPoints, todaySearches, ... }

// Get daily statistics for date range
metrics.getDailyStats({ startDate, endDate })
// Returns: [{ date, points, searches, quizzes, surveys, ... }]
```

#### Opportunities Router

```typescript
// Get available opportunities
opportunities.getOpportunities()
// Returns: [{ id, title, points, category, expiresAt, ... }]

// Create/track opportunity
opportunities.createOpportunity({ title, points, category, ... })
// Returns: { id, ... }

// Mark opportunity as complete
opportunities.completeOpportunity({ id })
// Returns: { success, pointsEarned }
```

### Bing Rewards Client

```typescript
import { createBingRewardsClient } from '@/lib/bing-rewards-client';

const client = createBingRewardsClient(accessToken);

// Get user profile
const profile = await client.getUserProfile();

// Get metrics
const metrics = await client.getMetrics();

// Get opportunities
const opportunities = await client.getOpportunities();

// Get daily stats
const stats = await client.getDailyStats(startDate, endDate);

// Complete opportunity
const result = await client.completeOpportunity(opportunityId);

// Get account health
const health = await client.getAccountHealth();

// Get trending opportunities
const trending = await client.getTrendingOpportunities();
```

## Database Schema

### Users Table
```typescript
users {
  id: UUID (primary key)
  email: string (unique)
  microsoftId: string
  name: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### User Metrics Table
```typescript
userMetrics {
  id: UUID (primary key)
  userId: UUID (foreign key)
  totalPoints: integer
  currentPoints: integer
  todayPoints: integer
  todaySearches: integer
  dailyQuota: integer
  accountStatus: enum
  lastUpdated: timestamp
}
```

### Daily Stats Table
```typescript
dailyStats {
  id: UUID (primary key)
  userId: UUID (foreign key)
  date: date
  points: integer
  searches: integer
  quizzes: integer
  surveys: integer
  shopping: integer
  xbox: integer
  createdAt: timestamp
}
```

### Opportunities Table
```typescript
opportunities {
  id: UUID (primary key)
  userId: UUID (foreign key)
  title: string
  description: text
  pointsValue: integer
  category: enum
  difficulty: enum
  estimatedTime: integer
  expiresAt: timestamp
  isCompleted: boolean
  completedAt: timestamp
  createdAt: timestamp
}
```

### Microsoft Tokens Table
```typescript
microsoftTokens {
  id: UUID (primary key)
  userId: UUID (foreign key)
  accessToken: string (encrypted)
  refreshToken: string (encrypted)
  expiresAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Development Workflow

### Creating a New Feature

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Create the component/hook**
   ```bash
   # Create component
   touch components/my-component.tsx
   
   # Create hook
   touch hooks/use-my-hook.ts
   ```

3. **Implement the feature**
   - Write TypeScript code with proper types
   - Follow existing patterns and conventions
   - Use Tailwind classes for styling
   - Add error handling

4. **Add tests**
   ```bash
   touch tests/my-feature.test.ts
   ```

5. **Test locally**
   ```bash
   pnpm dev
   # Test on iOS, Android, or Web
   ```

6. **Type check and lint**
   ```bash
   pnpm check
   pnpm lint
   ```

7. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/my-feature
   ```

8. **Create pull request**
   - Describe changes clearly
   - Link related issues
   - Request review

### Code Style Guidelines

**TypeScript:**
- Use strict type checking
- Avoid `any` types
- Export types alongside implementations
- Use interfaces for props

**React:**
- Use functional components
- Use hooks for state management
- Memoize expensive computations
- Avoid inline function definitions

**Styling:**
- Use Tailwind classes
- Avoid inline styles
- Use theme colors from `useColors()`
- Maintain responsive design

**Naming:**
- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Files: lowercase with hyphens
- Constants: UPPER_SNAKE_CASE

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/auth.test.ts

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyFeature', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Test logic
    expect(result).toBe(expected);
  });
});
```

### Test Coverage Goals

- Aim for 80%+ coverage
- Test critical paths
- Test error scenarios
- Test edge cases

## Deployment

### Building for Production

```bash
# Build web version
pnpm build

# Build iOS
eas build --platform ios

# Build Android APK
eas build --platform android --type apk

# Build Android AAB (for Play Store)
eas build --platform android
```

### Environment Variables

Create `.env.production` with production values:

```
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your-client-id
EXPO_PUBLIC_APP_NAME=Bing Rewards Automator
```

### Deployment Checklist

- [ ] All tests passing
- [ ] Type checking passes
- [ ] No console errors or warnings
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Security review completed
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Release notes prepared

## Troubleshooting

### Common Development Issues

**Issue: Metro bundler crashes**
- Solution: Clear cache with `watchman watch-del-all`
- Restart Metro bundler

**Issue: TypeScript errors**
- Solution: Run `pnpm check` to see all errors
- Fix errors one by one

**Issue: Database connection fails**
- Solution: Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Run migrations with `pnpm db:push`

**Issue: OAuth not working**
- Solution: Verify CLIENT_ID and CLIENT_SECRET
- Check redirect URIs are configured
- Clear app cache and reinstall

## Performance Optimization

### Best Practices

1. **Use React.memo** for expensive components
2. **Optimize images** with appropriate sizes
3. **Lazy load** screens and components
4. **Use FlatList** instead of ScrollView with map
5. **Memoize** expensive calculations
6. **Debounce** search and filter operations

### Profiling

```bash
# React Native profiler
npx react-native-cli log-android
```

## Contributing

1. Follow the code style guidelines
2. Write tests for new features
3. Update documentation
4. Submit pull request with clear description
5. Address review feedback

---

For more information, see the [main README](../README.md) or [User Guide](./USER_GUIDE.md).
