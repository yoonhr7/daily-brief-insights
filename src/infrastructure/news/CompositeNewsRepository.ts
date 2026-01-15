/**
 * Composite News Repository
 * Aggregates news from multiple sources (Google + Naver)
 */

import type { NewsRepository } from '../../domain/shared/repositories.js';
import type { NewsArticle, Domain } from '../../domain/shared/types.js';

export class CompositeNewsRepository implements NewsRepository {
  constructor(private repositories: NewsRepository[]) {}

  async fetchNews(domain: Domain): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];

    // Fetch from all repositories in parallel
    const results = await Promise.allSettled(
      this.repositories.map((repo) => repo.fetchNews(domain))
    );

    // Collect successful results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      } else {
        console.error('Failed to fetch from a repository:', result.reason);
      }
    }

    // Sort by publish date (newest first)
    const sorted = allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    // Remove duplicates by link and title
    return this.removeDuplicates(sorted);
  }

  /**
   * Remove duplicates by link or similar title
   */
  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seenLinks = new Set<string>();
    const seenTitles = new Set<string>();
    const result: NewsArticle[] = [];

    for (const article of articles) {
      // Skip if same link
      if (seenLinks.has(article.link)) {
        continue;
      }

      // Normalize title for comparison
      const normalizedTitle = this.normalizeTitle(article.title);

      // Skip if very similar title (likely same article from different source)
      if (seenTitles.has(normalizedTitle)) {
        continue;
      }

      seenLinks.add(article.link);
      seenTitles.add(normalizedTitle);
      result.push(article);
    }

    return result;
  }

  /**
   * Normalize title for duplicate detection
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
