/**
 * Bing Rewards Opportunities Tracker
 * Monitors and notifies users about additional earning opportunities
 * beyond searching (quizzes, surveys, shopping, Xbox, etc.)
 */

export interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'quiz' | 'survey' | 'shopping' | 'xbox' | 'daily-task' | 'bonus' | 'trending';
  pointsAvailable: number;
  timeToComplete: number; // in minutes
  expiresAt?: string;
  url?: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  isNew: boolean;
  isCompleted: boolean;
}

export interface OpportunitiesData {
  opportunities: EarningOpportunity[];
  lastChecked: string;
  totalPointsAvailable: number;
}

// Mock data - in production, this would come from Bing Rewards API
export const MOCK_OPPORTUNITIES: EarningOpportunity[] = [
  {
    id: 'quiz-1',
    title: 'Daily Quiz: Technology',
    description: 'Answer 3 questions about the latest tech trends',
    category: 'quiz',
    pointsAvailable: 50,
    timeToComplete: 2,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    icon: '🧠',
    isNew: true,
    isCompleted: false,
  },
  {
    id: 'survey-1',
    title: 'Quick Survey: Shopping Habits',
    description: 'Share your shopping preferences and earn points',
    category: 'survey',
    pointsAvailable: 100,
    timeToComplete: 5,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    icon: '📋',
    isNew: true,
    isCompleted: false,
  },
  {
    id: 'shopping-1',
    title: 'Shop at Microsoft Store',
    description: 'Earn 2x points on all Microsoft Store purchases today',
    category: 'shopping',
    pointsAvailable: 200,
    timeToComplete: 30,
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    icon: '🛍️',
    isNew: true,
    isCompleted: false,
  },
  {
    id: 'xbox-1',
    title: 'Xbox Game Pass Quest',
    description: 'Complete a challenge in your favorite Xbox game',
    category: 'xbox',
    pointsAvailable: 150,
    timeToComplete: 15,
    priority: 'medium',
    icon: '🎮',
    isNew: false,
    isCompleted: false,
  },
  {
    id: 'daily-task-1',
    title: 'Daily Set: Explore',
    description: 'Complete today\'s daily set tasks',
    category: 'daily-task',
    pointsAvailable: 120,
    timeToComplete: 10,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    icon: '✨',
    isNew: false,
    isCompleted: false,
  },
  {
    id: 'bonus-1',
    title: 'Bonus: Weekend Multiplier',
    description: 'Earn 1.5x points on all activities this weekend',
    category: 'bonus',
    pointsAvailable: 300,
    timeToComplete: 0,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    icon: '🎁',
    isNew: true,
    isCompleted: false,
  },
  {
    id: 'trending-1',
    title: 'Trending: AI & Machine Learning',
    description: 'Search trending topics to earn bonus points',
    category: 'trending',
    pointsAvailable: 75,
    timeToComplete: 5,
    priority: 'medium',
    icon: '🔥',
    isNew: true,
    isCompleted: false,
  },
];

/**
 * Get all available earning opportunities
 */
export function getOpportunities(): EarningOpportunity[] {
  return MOCK_OPPORTUNITIES;
}

/**
 * Get new opportunities (not yet completed)
 */
export function getNewOpportunities(): EarningOpportunity[] {
  return MOCK_OPPORTUNITIES.filter((opp) => opp.isNew && !opp.isCompleted);
}

/**
 * Get high-priority opportunities
 */
export function getHighPriorityOpportunities(): EarningOpportunity[] {
  return MOCK_OPPORTUNITIES.filter((opp) => opp.priority === 'high' && !opp.isCompleted);
}

/**
 * Get opportunities by category
 */
export function getOpportunitiesByCategory(
  category: EarningOpportunity['category']
): EarningOpportunity[] {
  return MOCK_OPPORTUNITIES.filter((opp) => opp.category === category && !opp.isCompleted);
}

/**
 * Calculate total available points
 */
export function getTotalAvailablePoints(): number {
  return MOCK_OPPORTUNITIES.filter((opp) => !opp.isCompleted).reduce(
    (sum, opp) => sum + opp.pointsAvailable,
    0
  );
}

/**
 * Get opportunities expiring soon (within 2 hours)
 */
export function getExpiringOpportunities(): EarningOpportunity[] {
  const now = Date.now();
  const twoHoursFromNow = now + 2 * 60 * 60 * 1000;

  return MOCK_OPPORTUNITIES.filter((opp) => {
    if (!opp.expiresAt) return false;
    const expiresAt = new Date(opp.expiresAt).getTime();
    return expiresAt > now && expiresAt <= twoHoursFromNow && !opp.isCompleted;
  });
}

/**
 * Mark opportunity as completed
 */
export function markOpportunityAsCompleted(opportunityId: string): void {
  const opportunity = MOCK_OPPORTUNITIES.find((opp) => opp.id === opportunityId);
  if (opportunity) {
    opportunity.isCompleted = true;
  }
}

/**
 * Format time remaining until expiration
 */
export function getTimeRemaining(expiresAt: string): string {
  const now = Date.now();
  const expiresAtTime = new Date(expiresAt).getTime();
  const diffMs = expiresAtTime - now;

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}
