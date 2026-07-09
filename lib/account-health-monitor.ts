/**
 * Account Health Monitor
 * Tracks account health status, detects captchas, unusual activity, and account restrictions
 * Provides real-time warnings and recommendations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface HealthFlag {
  id: string;
  type: 'captcha' | 'unusual_activity' | 'rate_limit' | 'restriction' | 'suspension_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  recommendation: string;
}

export interface AccountHealth {
  status: HealthStatus;
  score: number; // 0-100
  lastChecked: string;
  flags: HealthFlag[];
  automationPaused: boolean;
  pausedReason?: string;
}

const HEALTH_KEY = 'account_health_status';
const FLAGS_KEY = 'account_health_flags';

class AccountHealthMonitor {
  private health: AccountHealth = {
    status: 'healthy',
    score: 100,
    lastChecked: new Date().toISOString(),
    flags: [],
    automationPaused: false,
  };

  /**
   * Initialize health monitor
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(HEALTH_KEY);
      if (stored) {
        this.health = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  }

  /**
   * Get current account health
   */
  getHealth(): AccountHealth {
    return { ...this.health };
  }

  /**
   * Add a health flag (warning/issue)
   */
  async addFlag(flag: Omit<HealthFlag, 'timestamp' | 'resolved'>): Promise<void> {
    const newFlag: HealthFlag = {
      ...flag,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    this.health.flags.push(newFlag);
    await this.updateHealth();

    // Auto-pause automation on critical flags
    if (flag.severity === 'critical') {
      await this.pauseAutomation(`Critical issue detected: ${flag.title}`);
    }
  }

  /**
   * Detect captcha challenge
   */
  async detectCaptcha(details?: string): Promise<void> {
    await this.addFlag({
      id: `captcha_${Date.now()}`,
      type: 'captcha',
      severity: 'high',
      title: '🤖 Captcha Challenge Detected',
      description: details || 'A captcha challenge was encountered during automation',
      recommendation: 'Solve the captcha manually and resume automation when ready. Consider increasing delays between activities.',
    });
  }

  /**
   * Detect unusual activity
   */
  async detectUnusualActivity(details?: string): Promise<void> {
    await this.addFlag({
      id: `unusual_${Date.now()}`,
      type: 'unusual_activity',
      severity: 'high',
      title: '⚠️ Unusual Activity Detected',
      description: details || 'Bing Rewards detected unusual account activity',
      recommendation: 'Stop automation immediately. Wait 24-48 hours before resuming. Review your search patterns.',
    });
  }

  /**
   * Detect rate limiting
   */
  async detectRateLimit(details?: string): Promise<void> {
    await this.addFlag({
      id: `ratelimit_${Date.now()}`,
      type: 'rate_limit',
      severity: 'medium',
      title: '⏱️ Rate Limit Exceeded',
      description: details || 'Too many requests detected. Bing Rewards is throttling your account.',
      recommendation: 'Increase delays between searches to 30-45 seconds. Reduce automation frequency.',
    });
  }

  /**
   * Detect account restriction
   */
  async detectRestriction(details?: string): Promise<void> {
    await this.addFlag({
      id: `restriction_${Date.now()}`,
      type: 'restriction',
      severity: 'critical',
      title: '🚫 Account Restriction',
      description: details || 'Your account has been temporarily restricted from earning points',
      recommendation: 'Stop all automation immediately. Wait for the restriction to expire. Contact Microsoft support if needed.',
    });
  }

  /**
   * Detect suspension risk
   */
  async detectSuspensionRisk(details?: string): Promise<void> {
    await this.addFlag({
      id: `suspension_${Date.now()}`,
      type: 'suspension_risk',
      severity: 'critical',
      title: '⛔ Suspension Risk',
      description: details || 'Your account is at risk of suspension due to repeated violations',
      recommendation: 'STOP all automation immediately. Your account may be permanently banned. Wait 7+ days before any activity.',
    });
  }

  /**
   * Resolve a flag
   */
  async resolveFlag(flagId: string): Promise<void> {
    const flag = this.health.flags.find((f) => f.id === flagId);
    if (flag) {
      flag.resolved = true;
      await this.updateHealth();
    }
  }

  /**
   * Clear resolved flags
   */
  async clearResolvedFlags(): Promise<void> {
    this.health.flags = this.health.flags.filter((f) => !f.resolved);
    await this.updateHealth();
  }

  /**
   * Pause automation with reason
   */
  async pauseAutomation(reason: string): Promise<void> {
    this.health.automationPaused = true;
    this.health.pausedReason = reason;
    await this.updateHealth();
  }

  /**
   * Resume automation
   */
  async resumeAutomation(): Promise<void> {
    this.health.automationPaused = false;
    this.health.pausedReason = undefined;
    await this.updateHealth();
  }

  /**
   * Calculate health score based on flags
   */
  private calculateHealthScore(): number {
    let score = 100;

    for (const flag of this.health.flags) {
      if (flag.resolved) continue;

      switch (flag.severity) {
        case 'low':
          score -= 5;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'high':
          score -= 30;
          break;
        case 'critical':
          score -= 50;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Determine health status based on score
   */
  private determineStatus(): HealthStatus {
    const score = this.calculateHealthScore();

    if (score >= 80) return 'healthy';
    if (score >= 50) return 'warning';
    return 'critical';
  }

  /**
   * Update health status
   */
  private async updateHealth(): Promise<void> {
    this.health.score = this.calculateHealthScore();
    this.health.status = this.determineStatus();
    this.health.lastChecked = new Date().toISOString();

    try {
      await AsyncStorage.setItem(HEALTH_KEY, JSON.stringify(this.health));
    } catch (error) {
      console.error('Error saving health data:', error);
    }
  }

  /**
   * Get active flags (unresolved)
   */
  getActiveFlags(): HealthFlag[] {
    return this.health.flags.filter((f) => !f.resolved);
  }

  /**
   * Get critical flags
   */
  getCriticalFlags(): HealthFlag[] {
    return this.health.flags.filter((f) => !f.resolved && f.severity === 'critical');
  }

  /**
   * Get health status icon
   */
  getStatusIcon(): string {
    switch (this.health.status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return '❓';
    }
  }

  /**
   * Get health status color
   */
  getStatusColor(): string {
    switch (this.health.status) {
      case 'healthy':
        return '#22C55E';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  /**
   * Reset health (for testing)
   */
  async reset(): Promise<void> {
    this.health = {
      status: 'healthy',
      score: 100,
      lastChecked: new Date().toISOString(),
      flags: [],
      automationPaused: false,
    };
    await this.updateHealth();
  }
}

// Export singleton instance
export const accountHealthMonitor = new AccountHealthMonitor();

export default accountHealthMonitor;
