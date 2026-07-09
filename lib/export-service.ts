/**
 * Export Service
 * Handles exporting sync history and earning trends to CSV
 */

import * as FileSystem from 'expo-file-system/legacy';
import { syncService } from './sync-service';
import { analyticsService } from './analytics-service';

export interface ExportOptions {
  includeHistory: boolean;
  includeTrends: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class ExportService {
  /**
   * Generate CSV header
   */
  private generateCSVHeader(columns: string[]): string {
    return columns.map((col) => `"${col}"`).join(',') + '\n';
  }

  /**
   * Escape CSV value
   */
  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) return '""';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
  }

  /**
   * Generate sync history CSV
   */
  async generateSyncHistoryCSV(): Promise<string> {
    try {
      const history = await syncService.getSyncHistory();
      const syncData = await syncService.getSyncData();

      let csv = this.generateCSVHeader([
        'Timestamp',
        'Source',
        'Total Points',
        'Total Searches',
        'Desktop Searches',
        'Mobile Searches',
        'Streak Days',
        'Account Health Score',
      ]);

      if (syncData) {
        csv += [
          new Date(syncData.lastUpdated).toLocaleString(),
          syncData.source,
          syncData.totalPoints,
          syncData.totalSearches,
          syncData.desktopSearches,
          syncData.mobileSearches,
          syncData.streakDays,
          syncData.accountHealth.score,
        ]
          .map((val) => this.escapeCSVValue(val))
          .join(',') + '\n';
      }

      history.forEach((entry) => {
        csv += [
          new Date(entry.timestamp).toLocaleString(),
          entry.source || 'unknown',
          entry.points || 0,
          entry.searches || 0,
          0,
          0,
          0,
          100,
        ]
          .map((val) => this.escapeCSVValue(val))
          .join(',') + '\n';
      });

      return csv;
    } catch (error) {
      console.error('Error generating sync history CSV:', error);
      throw error;
    }
  }

  /**
   * Generate earning trends CSV
   */
  async generateEarningTrendsCSV(): Promise<string> {
    try {
      const records = await analyticsService.getDailyRecords();

      let csv = this.generateCSVHeader([
        'Date',
        'Total Points',
        'Total Searches',
        'Total Activities',
        'Points Per Search',
        'Efficiency Score',
        'Trend',
      ]);

      records.forEach((record) => {
        const pointsPerSearch =
          record.searchesCompleted > 0 ? (record.pointsEarned / record.searchesCompleted).toFixed(2) : '0';
        const efficiency = ((record.pointsEarned / 50) * 100).toFixed(0); // Assume 50 points/day target

        csv += [
          new Date(record.date).toLocaleDateString(),
          record.pointsEarned,
          record.searchesCompleted,
          record.activitiesCompleted || 0,
          pointsPerSearch,
          efficiency + '%',
          'stable',
        ]
          .map((val) => this.escapeCSVValue(val))
          .join(',') + '\n';
      });

      return csv;
    } catch (error) {
      console.error('Error generating earning trends CSV:', error);
      throw error;
    }
  }

  /**
   * Export combined report
   */
  async exportCombinedReport(options: Partial<ExportOptions> = {}): Promise<string> {
    try {
      let csv = '';

      // Add title and metadata
      csv += 'Bing Rewards Automator - Data Export Report\n';
      csv += `Generated: ${new Date().toLocaleString()}\n\n`;

      // Add sync history
      if (options.includeTrends) {
        csv += '=== EARNING TRENDS ===\n';
        csv += await this.generateEarningTrendsCSV();
        csv += '\n\n';
      }

      // Add earning trends
      if (options.includeHistory) {
        csv += '=== SYNC HISTORY ===\n';
        csv += await this.generateSyncHistoryCSV();
      }

      return csv;
    } catch (error) {
      console.error('Error exporting combined report:', error);
      throw error;
    }
  }

  /**
   * Save and share CSV file
   */
  async saveAndShareCSV(filename: string, csvContent: string): Promise<void> {
    try {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Log file location for user
      console.log('CSV file saved to:', fileUri);
      console.log('File ready for download:', filename);
    } catch (error) {
      console.error('Error saving CSV:', error);
      throw error;
    }
  }

  /**
   * Export sync history to CSV
   */
  async exportSyncHistory(): Promise<void> {
    try {
      const csv = await this.generateSyncHistoryCSV();
      const filename = `bing-rewards-sync-history-${new Date().toISOString().split('T')[0]}.csv`;
      await this.saveAndShareCSV(filename, csv);
    } catch (error) {
      console.error('Error exporting sync history:', error);
      throw error;
    }
  }

  /**
   * Export earning trends to CSV
   */
  async exportEarningTrends(): Promise<void> {
    try {
      const csv = await this.generateEarningTrendsCSV();
      const filename = `bing-rewards-trends-${new Date().toISOString().split('T')[0]}.csv`;
      await this.saveAndShareCSV(filename, csv);
    } catch (error) {
      console.error('Error exporting earning trends:', error);
      throw error;
    }
  }

  /**
   * Export combined report
   */
  async exportFullReport(): Promise<void> {
    try {
      const csv = await this.exportCombinedReport({
        includeHistory: true,
        includeTrends: true,
      } as ExportOptions);
      const filename = `bing-rewards-full-report-${new Date().toISOString().split('T')[0]}.csv`;
      await this.saveAndShareCSV(filename, csv);
    } catch (error) {
      console.error('Error exporting full report:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
