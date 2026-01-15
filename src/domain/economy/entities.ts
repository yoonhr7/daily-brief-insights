/**
 * Economy Domain Entities
 */

import type { EconomyInsight, EconomyInsightData } from './types.js';
import type { Priority, InsightStatus } from '../shared/types.js';

export type CreateEconomyInsightParams = {
  title: string;
  summary: string;
  data: EconomyInsightData;
  priority?: Priority;
  tags?: string[];
  sourceUrls?: string[];
};

/**
 * Factory function to create Economy Insight
 */
export function createEconomyInsight(
  params: CreateEconomyInsightParams
): EconomyInsight {
  return {
    id: generateId(),
    domain: 'economy',
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
  insight: EconomyInsight,
  status: InsightStatus
): EconomyInsight {
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
  return `economy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
