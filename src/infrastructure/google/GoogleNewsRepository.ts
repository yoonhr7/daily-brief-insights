/**
 * Google News Repository Implementation
 * Uses Google News RSS feeds
 */

import Parser from 'rss-parser';
import type { NewsRepository } from '../../domain/shared/repositories.js';
import type { NewsArticle, Domain } from '../../domain/shared/types.js';

type GoogleNewsConfig = {
  language: string; // e.g., 'ko', 'en'
  country: string; // e.g., 'KR', 'US'
};

export class GoogleNewsRepository implements NewsRepository {
  private parser: Parser;
  private config: GoogleNewsConfig;

  // Google News RSS base URL
  private readonly baseUrl = 'https://news.google.com/rss';

  constructor(config: GoogleNewsConfig) {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'DailyBrief/1.0',
      },
    });
    this.config = config;
  }

  async fetchNews(domain: Domain): Promise<NewsArticle[]> {
    const queries = this.getQueriesForDomain(domain);
    const articles: NewsArticle[] = [];

    for (const query of queries) {
      try {
        const feedUrl = this.buildFeedUrl(query);
        const feed = await this.parser.parseURL(feedUrl);

        for (const item of feed.items) {
          if (!item.title || !item.link) {
            continue;
          }

          articles.push({
            title: item.title,
            link: item.link,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            content: this.cleanContent(item.contentSnippet ?? item.content ?? ''),
            source: item.source?.name ?? 'Google News',
          });
        }
      } catch (error) {
        console.error(`Failed to fetch Google News for query: ${query}`, error);
        // Continue with other queries even if one fails
      }
    }

    // Remove duplicates by link
    return this.removeDuplicates(articles);
  }

  /**
   * Get search queries based on domain
   */
  private getQueriesForDomain(domain: Domain): string[] {
    if (domain === 'economy') {
      return [
        '환율',
        '금리',
        '증시',
        '경제',
        'exchange rate',
        'interest rate',
        'stock market',
      ];
    } else {
      return [
        'IT',
        '기술',
        '프로그래밍',
        '개발자',
        'technology',
        'programming',
        'software',
        'developer',
      ];
    }
  }

  /**
   * Build Google News RSS feed URL with query
   */
  private buildFeedUrl(query: string): string {
    const params = new URLSearchParams({
      q: query,
      hl: this.config.language,
      gl: this.config.country,
      ceid: `${this.config.country}:${this.config.language}`,
    });

    return `${this.baseUrl}/search?${params.toString()}`;
  }

  /**
   * Clean HTML content from RSS
   */
  private cleanContent(content: string): string {
    // Remove HTML tags
    const cleaned = content.replace(/<[^>]*>/g, '');
    // Remove extra whitespace
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  /**
   * Remove duplicate articles by link
   */
  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter((article) => {
      if (seen.has(article.link)) {
        return false;
      }
      seen.add(article.link);
      return true;
    });
  }

  /**
   * Factory method to create instance from environment variables
   */
  static fromEnv(): GoogleNewsRepository {
    const language = process.env['GOOGLE_NEWS_LANGUAGE'] ?? 'ko';
    const country = process.env['GOOGLE_NEWS_COUNTRY'] ?? 'KR';

    return new GoogleNewsRepository({
      language,
      country,
    });
  }
}
