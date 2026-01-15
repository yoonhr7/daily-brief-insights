/**
 * RSS News Repository Implementation
 */

import Parser from 'rss-parser';
import type { NewsRepository } from '../../domain/shared/repositories.js';
import type { NewsArticle, Domain } from '../../domain/shared/types.js';

type RSSConfig = {
  economyFeeds: string[];
  itFeeds: string[];
};

export class RSSNewsRepository implements NewsRepository {
  private parser: Parser;
  private config: RSSConfig;

  constructor(config: RSSConfig) {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'DailyBrief/1.0',
      },
    });
    this.config = config;
  }

  async fetchNews(domain: Domain): Promise<NewsArticle[]> {
    const feeds = domain === 'economy' ? this.config.economyFeeds : this.config.itFeeds;

    const articles: NewsArticle[] = [];

    for (const feedUrl of feeds) {
      try {
        const feed = await this.parser.parseURL(feedUrl);

        for (const item of feed.items) {
          if (!item.title || !item.link) {
            continue;
          }

          articles.push({
            title: item.title,
            link: item.link,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            content: item.contentSnippet ?? item.content ?? '',
            source: feed.title ?? feedUrl,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch RSS feed: ${feedUrl}`, error);
        // Continue with other feeds even if one fails
      }
    }

    return articles;
  }

  /**
   * Factory method to create instance from environment variables
   */
  static fromEnv(): RSSNewsRepository {
    const economyFeeds = process.env['ECONOMY_RSS_FEEDS']?.split(',').map((s) => s.trim()) ?? [];
    const itFeeds = process.env['IT_RSS_FEEDS']?.split(',').map((s) => s.trim()) ?? [];

    return new RSSNewsRepository({
      economyFeeds,
      itFeeds,
    });
  }
}
