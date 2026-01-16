/**
 * Shared domain types
 */

export type Domain = 'economy' | 'it';

export type Priority = 'high' | 'medium' | 'low';

export type InsightStatus = 'draft' | 'published' | 'archived';

/**
 * Base Insight structure
 * Contains common fields for all insights regardless of domain
 */
export type BaseInsight = {
  id: string;
  domain: Domain;
  title: string;
  summary: string;
  easyExplanation?: string; // 💡 쉽게 이해하기 섹션
  analysisDate: Date;
  status: InsightStatus;
  priority: Priority;
  tags: string[];
  sourceUrls: string[];
};

/**
 * News Article from RSS feed
 */
export type NewsArticle = {
  title: string;
  link: string;
  publishedAt: Date;
  content: string;
  source: string;
};
