/**
 * Economy Domain Entities
 */

import type { EconomyInsight, EconomyInsightData } from './types.js';
import type { Priority, InsightStatus } from '../shared/types.js';

export type CreateEconomyInsightParams = {
  title: string;
  summary: string;
  easyExplanation?: string;
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
  const baseInsight = {
    id: generateId(),
    domain: 'economy' as const,
    title: params.title,
    summary: params.summary,
    data: params.data,
    analysisDate: new Date(),
    status: 'draft' as const,
    priority: params.priority ?? 'medium',
    tags: params.tags ?? [],
    sourceUrls: params.sourceUrls ?? [],
  };

  if (params.easyExplanation) {
    return {
      ...baseInsight,
      easyExplanation: params.easyExplanation,
    };
  }

  return baseInsight;
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
