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
import { OpenAIEconomyAnalyzer } from './analyzers/OpenAIEconomyAnalyzer.js';
import { OpenAIITAnalyzer } from './analyzers/OpenAIITAnalyzer.js';

export class AnalyzeNewsUseCase {
  private openaiApiKey: string;

  constructor(
    private newsRepository: NewsRepository,
    private insightRepository: InsightRepository,
    private notificationService: NotificationService,
    openaiApiKey?: string
  ) {
    this.openaiApiKey = openaiApiKey || process.env.OPENAI_API_KEY || '';
    if (!this.openaiApiKey) {
      throw new Error('OPENAI_API_KEY must be set');
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

    // Step 4: Send batch notification via KakaoTalk (optional)
    try {
      await this.notificationService.sendBatch(insights);
      console.log(`[${domain}] ✓ Sent notification to KakaoTalk`);
    } catch (error) {
      console.warn(`[${domain}] ⚠️  Failed to send KakaoTalk notification (continuing anyway):`, error instanceof Error ? error.message : error);
      console.warn(`[${domain}] Note: You may need to refresh your Kakao Access Token`);
    }

    console.log(`[${domain}] Analysis completed successfully`);
  }

  /**
   * Analyze articles and generate insights
   * Uses LLM-based analyzers with OpenAI GPT-4o-mini
   */
  private async analyzeArticles(
    articles: NewsArticle[],
    domain: Domain
  ): Promise<Insight[]> {
    if (domain === 'economy') {
      const analyzer = new OpenAIEconomyAnalyzer(this.openaiApiKey);
      return analyzer.analyze(articles);
    } else {
      const analyzer = new OpenAIITAnalyzer(this.openaiApiKey);
      return analyzer.analyze(articles);
    }
  }
}
