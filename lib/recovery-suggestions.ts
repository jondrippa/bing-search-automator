/**
 * Recovery Suggestions Engine
 * Generates intelligent recovery suggestions and countdown timers based on flag types
 */

export interface RecoverySuggestion {
  title: string;
  description: string;
  waitTimeMs: number; // milliseconds to wait
  canResumeAt: string; // ISO timestamp when safe to resume
  actions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
}

type FlagType = 'captcha' | 'unusual_activity' | 'rate_limit' | 'restriction' | 'suspension_risk';

/**
 * Generate recovery suggestion based on flag type
 */
export function generateRecoverySuggestion(
  flagType: FlagType,
  flagTimestamp: string
): RecoverySuggestion {
  const now = new Date();
  const flagTime = new Date(flagTimestamp);

  switch (flagType) {
    case 'captcha':
      return {
        title: '🤖 Captcha Challenge',
        description: 'You encountered a captcha. This is a temporary challenge.',
        waitTimeMs: 15 * 60 * 1000, // 15 minutes
        canResumeAt: new Date(flagTime.getTime() + 15 * 60 * 1000).toISOString(),
        actions: [
          'Solve the captcha manually',
          'Wait 15 minutes before resuming',
          'Increase delays between searches to 30-45 seconds',
          'Avoid rapid repeated searches',
        ],
        priority: 'medium',
        icon: '🤖',
      };

    case 'rate_limit':
      return {
        title: '⏱️ Rate Limit Exceeded',
        description: 'Too many requests detected. Your account is being throttled.',
        waitTimeMs: 30 * 60 * 1000, // 30 minutes
        canResumeAt: new Date(flagTime.getTime() + 30 * 60 * 1000).toISOString(),
        actions: [
          'Stop all automation immediately',
          'Wait 30 minutes for the limit to reset',
          'Increase delays to 45-60 seconds between searches',
          'Reduce daily search quota by 25%',
          'Avoid searching during peak hours (8 AM - 5 PM)',
        ],
        priority: 'high',
        icon: '⏱️',
      };

    case 'unusual_activity':
      return {
        title: '⚠️ Unusual Activity Detected',
        description: 'Bing Rewards flagged unusual account activity. Your account needs rest.',
        waitTimeMs: 48 * 60 * 60 * 1000, // 48 hours
        canResumeAt: new Date(flagTime.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        actions: [
          'STOP all automation immediately',
          'Wait 48 hours before any activity',
          'Log in manually to verify account status',
          'Review your search patterns for irregularities',
          'When resuming: use manual searches only for first 24 hours',
          'Gradually increase automation frequency',
          'Increase all delays by 50%',
        ],
        priority: 'critical',
        icon: '⚠️',
      };

    case 'restriction':
      return {
        title: '🚫 Account Restricted',
        description: 'Your account has been temporarily restricted from earning points.',
        waitTimeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
        canResumeAt: new Date(flagTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        actions: [
          'STOP all automation immediately',
          'Wait minimum 7 days before resuming',
          'Check Microsoft Rewards dashboard for status updates',
          'Contact Microsoft support if restriction persists',
          'When restriction lifts: start with manual searches only',
          'Use conservative automation settings for 2 weeks',
          'Monitor account health closely for 30 days',
        ],
        priority: 'critical',
        icon: '🚫',
      };

    case 'suspension_risk':
      return {
        title: '⛔ Suspension Risk',
        description: 'Your account is at high risk of permanent suspension.',
        waitTimeMs: 14 * 24 * 60 * 60 * 1000, // 14 days
        canResumeAt: new Date(flagTime.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        actions: [
          'STOP ALL AUTOMATION IMMEDIATELY',
          'Do not use this tool for 14+ days',
          'Avoid any suspicious activity on your account',
          'Use only manual searches if you must earn points',
          'Contact Microsoft support to appeal',
          'After 14 days: manually verify account status',
          'If account is still active: use ONLY manual searches for 30 days',
          'Consider using a different account for automation',
        ],
        priority: 'critical',
        icon: '⛔',
      };

    default:
      return {
        title: '❓ Unknown Issue',
        description: 'An unknown issue was detected.',
        waitTimeMs: 60 * 60 * 1000, // 1 hour default
        canResumeAt: new Date(flagTime.getTime() + 60 * 60 * 1000).toISOString(),
        actions: ['Wait 1 hour', 'Check account status manually'],
        priority: 'medium',
        icon: '❓',
      };
  }
}

/**
 * Calculate remaining wait time in milliseconds
 */
export function getRemainingWaitTime(canResumeAt: string): number {
  const now = new Date().getTime();
  const resumeTime = new Date(canResumeAt).getTime();
  return Math.max(0, resumeTime - now);
}

/**
 * Format milliseconds to human-readable time
 */
export function formatWaitTime(ms: number): string {
  if (ms <= 0) return 'Now';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get the most critical recovery suggestion from multiple flags
 */
export function getMostCriticalSuggestion(
  suggestions: RecoverySuggestion[]
): RecoverySuggestion | null {
  if (suggestions.length === 0) return null;

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )[0];
}
