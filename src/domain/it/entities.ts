/**
 * IT Domain Entities
 */

import type { ITInsight, ITInsightData } from './types.js';
import type { Priority, InsightStatus } from '../shared/types.js';

export type CreateITInsightParams = {
  title: string;
  summary: string;
  data: ITInsightData;
  priority?: Priority;
  tags?: string[];
  sourceUrls?: string[];
};

/**
 * Factory function to create IT Insight
 */
export function createITInsight(params: CreateITInsightParams): ITInsight {
  return {
    id: generateId(),
    domain: 'it',
    title: params.title,
    summary: params.summary,
    data: params.data,
    analysisDate: new Date(),
    status: 'draft',
    priority: params.priority ?? 'medium',
    tags: params.tags ?? [],
    sourceUrls: params.sourceUrls ?? [],
  };
}

/**
 * Update insight status
 */
export function updateInsightStatus(
  insight: ITInsight,
  status: InsightStatus
): ITInsight {
  return {
    ...insight,
    status,
  };
}

/**
 * Generate unique ID
 * TODO: Replace with proper UUID generator
 */
function generateId(): string {
  return `it-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
