/**
 * Repository interfaces
 * Domain layer defines contracts, infrastructure implements them
 */

import type { Insight } from './insight.js';
import type { NewsArticle, Domain } from './types.js';

/**
 * News feed repository
 * Fetches news articles from RSS feeds
 */
export interface NewsRepository {
  /**
   * Fetch news articles for a specific domain
   */
  fetchNews(domain: Domain): Promise<NewsArticle[]>;
}

/**
 * Insight repository
 * Persists insights to storage (Notion DB)
 */
export interface InsightRepository {
  /**
   * Save a new insight
   */
  save(insight: Insight): Promise<void>;

  /**
   * Find insights by domain
   */
  findByDomain(domain: Domain): Promise<Insight[]>;

  /**
   * Find insight by ID
   */
  findById(id: string): Promise<Insight | undefined>;

  /**
   * Update existing insight
   */
  update(insight: Insight): Promise<void>;
}

/**
 * Notification service
 * Sends insights via messaging platforms
 */
export interface NotificationService {
  /**
   * Send insight notification
   */
  send(insight: Insight): Promise<void>;

  /**
   * Send batch of insights
   */
  sendBatch(insights: Insight[]): Promise<void>;
}
