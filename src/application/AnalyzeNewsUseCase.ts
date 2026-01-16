/**
 * Analyze News Use Case
 *
 * Orchestrates the analysis workflow:
 * 1. Fetch news from RSS feeds
 * 2. Analyze and generate insights
 * 3. Save to Notion
 * 4. Send notifications via KakaoTalk
 */

import type { NewsRepository, InsightRepository, NotificationService } from '../domain/shared/repositories.js';
import type { Domain, NewsArticle } from '../domain/shared/types.js';
import type { Insight } from '../domain/shared/insight.js';
import { LLMEconomyAnalyzer } from './analyzers/LLMEconomyAnalyzer.js';
import { LLMITAnalyzer } from './analyzers/LLMITAnalyzer.js';

export class AnalyzeNewsUseCase {
  private geminiApiKey: string;

  constructor(
    private newsRepository: NewsRepository,
    private insightRepository: InsightRepository,
    private notificationService: NotificationService,
    geminiApiKey?: string
  ) {
    this.geminiApiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
    if (!this.geminiApiKey) {
      throw new Error('GEMINI_API_KEY must be set');
    }
  }

  async execute(domain: Domain): Promise<void> {
    console.log(`[${domain}] Starting analysis...`);

    // Step 1: Fetch news
    const articles = await this.newsRepository.fetchNews(domain);
    console.log(`[${domain}] Fetched ${articles.length} articles`);

    if (articles.length === 0) {
      console.log(`[${domain}] No articles found. Skipping analysis.`);
      return;
    }

    // Step 2: Analyze articles and generate insights
    // TODO: Implement actual analysis logic
    // For now, this is a placeholder
    const insights = await this.analyzeArticles(articles, domain);
    console.log(`[${domain}] Generated ${insights.length} insights`);

    if (insights.length === 0) {
      console.log(`[${domain}] No insights generated. Skipping save and notification.`);
      return;
    }

    // Step 3: Save insights to Notion
    console.log(`[${domain}] Attempting to save ${insights.length} insights to Notion...`);
    for (let i = 0; i < insights.length; i++) {
      const insight = insights[i];
      if (!insight) continue;

      console.log(`[${domain}] Saving insight ${i + 1}/${insights.length}: ${insight.title}`);
      try {
        await this.insightRepository.save(insight);
        console.log(`[${domain}] ✓ Successfully saved insight ${i + 1}`);
      } catch (error) {
        console.error(`[${domain}] ✗ Failed to save insight ${i + 1}:`, error);
        throw error;
      }
    }
    console.log(`[${domain}] Saved ${insights.length} insights to Notion`);

    // Step 4: Send batch notification via KakaoTalk
    await this.notificationService.sendBatch(insights);
    console.log(`[${domain}] Sent notification to KakaoTalk`);

    console.log(`[${domain}] Analysis completed successfully`);
  }

  /**
   * Analyze articles and generate insights
   * Uses LLM-based analyzers with Gemini
   */
  private async analyzeArticles(
    articles: NewsArticle[],
    domain: Domain
  ): Promise<Insight[]> {
    if (domain === 'economy') {
      const analyzer = new LLMEconomyAnalyzer(this.geminiApiKey);
      return analyzer.analyze(articles);
    } else {
      const analyzer = new LLMITAnalyzer(this.geminiApiKey);
      return analyzer.analyze(articles);
    }
  }
}
