/**
 * Notion Insight Repository Implementation
 */

import { Client } from '@notionhq/client';
import type { InsightRepository } from '../../domain/shared/repositories.js';
import type { Insight } from '../../domain/shared/insight.js';
import type { Domain } from '../../domain/shared/types.js';
import { isEconomyInsight, isITInsight } from '../../domain/shared/insight.js';

type NotionConfig = {
  apiKey: string;
  databaseId: string;
};

export class NotionInsightRepository implements InsightRepository {
  private client: Client;
  private databaseId: string;

  constructor(config: NotionConfig) {
    this.client = new Client({ auth: config.apiKey });
    this.databaseId = config.databaseId;
  }

  async save(insight: Insight): Promise<void> {
    try {
      await this.client.pages.create({
        parent: { database_id: this.databaseId },
        properties: this.mapInsightToProperties(insight) as any,
      });
    } catch (error) {
      console.error('Failed to save insight to Notion:', error);
      throw new Error('Failed to save insight to Notion');
    }
  }

  async findByDomain(_domain: Domain): Promise<Insight[]> {
    // TODO: Implement query and mapping from Notion pages to Insight objects
    throw new Error('Not implemented yet');
  }

  async findById(_id: string): Promise<Insight | undefined> {
    // TODO: Implement query by ID
    throw new Error('Not implemented yet');
  }

  async update(_insight: Insight): Promise<void> {
    // TODO: Implement update logic
    throw new Error('Not implemented yet');
  }

  /**
   * Map Insight to Notion page properties
   */
  private mapInsightToProperties(insight: Insight): Record<string, unknown> {
    const baseProperties = {
      // Title property
      제목: {
        title: [
          {
            text: { content: insight.title },
          },
        ],
      },
      // Domain
      도메인: {
        select: { name: insight.domain === 'economy' ? '경제' : 'IT' },
      },
      // Status
      상태: {
        select: {
          name:
            insight.status === 'draft'
              ? '초안'
              : insight.status === 'published'
                ? '발행됨'
                : '보관됨',
        },
      },
      // Priority
      우선순위: {
        select: {
          name:
            insight.priority === 'high'
              ? '높음'
              : insight.priority === 'medium'
                ? '중간'
                : '낮음',
        },
      },
      // Analysis Date
      분석일: {
        date: { start: insight.analysisDate.toISOString() },
      },
      // Tags
      태그: {
        multi_select: insight.tags.map((tag) => ({ name: tag })),
      },
      // Summary (Rich text)
      요약: {
        rich_text: [
          {
            text: { content: insight.summary },
          },
        ],
      },
    };

    // Add domain-specific properties
    if (isEconomyInsight(insight)) {
      return {
        ...baseProperties,
        이슈유형: {
          select: { name: this.mapEconomyIssueType(insight.data.issueType) },
        },
        // TODO: Add more economy-specific fields
      };
    } else if (isITInsight(insight)) {
      return {
        ...baseProperties,
        변화유형: {
          select: { name: this.mapITChangeType(insight.data.changeType) },
        },
        영향도: {
          select: {
            name:
              insight.data.impact.level === 'critical'
                ? '긴급'
                : insight.data.impact.level === 'significant'
                  ? '중요'
                  : insight.data.impact.level === 'moderate'
                    ? '보통'
                    : '낮음',
          },
        },
        // TODO: Add more IT-specific fields
      };
    }

    return baseProperties;
  }

  private mapEconomyIssueType(type: string): string {
    const map: Record<string, string> = {
      exchange_rate: '환율',
      interest_rate: '금리',
      equity_market: '증시',
      commodity: '원자재',
      policy: '정책',
      other: '기타',
    };
    return map[type] ?? '기타';
  }

  private mapITChangeType(type: string): string {
    const map: Record<string, string> = {
      product_release: '제품출시',
      policy_change: '정책변경',
      tech_adoption: '기술도입',
      tech_deprecation: '기술폐기',
      security: '보안',
      organization: '조직변화',
      other: '기타',
    };
    return map[type] ?? '기타';
  }

  /**
   * Factory method to create instance from environment variables
   */
  static fromEnv(): NotionInsightRepository {
    const apiKey = process.env['NOTION_API_KEY'];
    const databaseId = process.env['NOTION_DATABASE_ID'];

    if (!apiKey || !databaseId) {
      throw new Error('NOTION_API_KEY and NOTION_DATABASE_ID must be set');
    }

    return new NotionInsightRepository({
      apiKey,
      databaseId,
    });
  }
}
