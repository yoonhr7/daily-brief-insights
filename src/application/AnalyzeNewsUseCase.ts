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
import type { Domain } from '../domain/shared/types.js';
import type { Insight } from '../domain/shared/insight.js';

export class AnalyzeNewsUseCase {
  constructor(
    private newsRepository: NewsRepository,
    private insightRepository: InsightRepository,
    private notificationService: NotificationService
  ) {}

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
    for (const insight of insights) {
      await this.insightRepository.save(insight);
    }
    console.log(`[${domain}] Saved ${insights.length} insights to Notion`);

    // Step 4: Send batch notification via KakaoTalk
    await this.notificationService.sendBatch(insights);
    console.log(`[${domain}] Sent notification to KakaoTalk`);

    console.log(`[${domain}] Analysis completed successfully`);
  }

  /**
   * Analyze articles and generate insights
   * TODO: Implement actual analysis logic with LLM or rule-based system
   */
  private async analyzeArticles(
    articles: unknown[],
    domain: Domain
  ): Promise<Insight[]> {
    // Placeholder implementation
    // In real implementation, this would:
    // 1. Use LLM (Claude, GPT, etc.) to analyze articles
    // 2. Extract key information based on domain
    // 3. Generate structured insights
    // 4. Apply domain-specific analysis rules

    console.log(`TODO: Implement ${domain} analysis for ${articles.length} articles`);
    return [];
  }
}
