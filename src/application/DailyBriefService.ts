/**
 * Daily Brief Service
 *
 * High-level service that coordinates the entire daily brief workflow
 */

import { AnalyzeNewsUseCase } from './AnalyzeNewsUseCase.js';
import type { NewsRepository, InsightRepository, NotificationService } from '../domain/shared/repositories.js';

export class DailyBriefService {
  private analyzeNewsUseCase: AnalyzeNewsUseCase;

  constructor(
    newsRepository: NewsRepository,
    insightRepository: InsightRepository,
    notificationService: NotificationService,
    geminiApiKey?: string
  ) {
    this.analyzeNewsUseCase = new AnalyzeNewsUseCase(
      newsRepository,
      insightRepository,
      notificationService,
      geminiApiKey
    );
  }

  /**
   * Run the complete daily brief analysis
   * Analyzes both Economy and IT domains
   */
  async runDailyBrief(): Promise<void> {
    console.log('='.repeat(50));
    console.log('Daily Brief Analysis Started');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('='.repeat(50));

    try {
      // Analyze Economy domain
      await this.analyzeNewsUseCase.execute('economy');

      // Analyze IT domain
      await this.analyzeNewsUseCase.execute('it');

      console.log('='.repeat(50));
      console.log('Daily Brief Analysis Completed Successfully');
      console.log('='.repeat(50));
    } catch (error) {
      console.error('Daily Brief Analysis Failed:', error);
      throw error;
    }
  }
}
