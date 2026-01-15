/**
 * Naver News API Repository Implementation
 * Uses Naver Search API (News)
 */

import type { NewsRepository } from '../../domain/shared/repositories.js';
import type { NewsArticle, Domain } from '../../domain/shared/types.js';

type NaverConfig = {
  clientId: string;
  clientSecret: string;
};

type NaverNewsItem = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
};

type NaverNewsResponse = {
  items: NaverNewsItem[];
  total: number;
  start: number;
  display: number;
};

export class NaverNewsRepository implements NewsRepository {
  private config: NaverConfig;
  private readonly apiUrl = 'https://openapi.naver.com/v1/search/news.json';

  constructor(config: NaverConfig) {
    this.config = config;
  }

  async fetchNews(domain: Domain): Promise<NewsArticle[]> {
    const queries = this.getQueriesForDomain(domain);
    const articles: NewsArticle[] = [];

    for (const query of queries) {
      try {
        const items = await this.searchNews(query);

        for (const item of items) {
          articles.push({
            title: this.cleanHtml(item.title),
            link: item.originallink || item.link,
            publishedAt: new Date(item.pubDate),
            content: this.cleanHtml(item.description),
            source: 'Naver News',
          });
        }
      } catch (error) {
        console.error(`Failed to fetch Naver News for query: ${query}`, error);
        // Continue with other queries even if one fails
      }
    }

    // Remove duplicates by link
    return this.removeDuplicates(articles);
  }

  /**
   * Search news using Naver API
   */
  private async searchNews(query: string, display: number = 20): Promise<NaverNewsItem[]> {
    const params = new URLSearchParams({
      query,
      display: display.toString(),
      sort: 'date', // Sort by date (newest first)
    });

    const response = await fetch(`${this.apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': this.config.clientId,
        'X-Naver-Client-Secret': this.config.clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver API error: ${response.statusText}`);
    }

    const data = (await response.json()) as NaverNewsResponse;
    return data.items;
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
        '경제 이슈',
        '주식시장',
        '원자재',
      ];
    } else {
      return [
        'IT 기술',
        '프로그래밍',
        '개발자',
        '소프트웨어',
        '클라우드',
        '보안',
      ];
    }
  }

  /**
   * Clean HTML tags from text
   */
  private cleanHtml(text: string): string {
    // Remove HTML tags
    const cleaned = text.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    const decoded = cleaned
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    // Remove extra whitespace
    return decoded.replace(/\s+/g, ' ').trim();
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
  static fromEnv(): NaverNewsRepository {
    const clientId = process.env['NAVER_CLIENT_ID'];
    const clientSecret = process.env['NAVER_CLIENT_SECRET'];

    if (!clientId || !clientSecret) {
      throw new Error('NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set');
    }

    return new NaverNewsRepository({
      clientId,
      clientSecret,
    });
  }
}
