/**
 * Union type for all insights
 */

import type { EconomyInsight } from '../economy/types.js';
import type { ITInsight } from '../it/types.js';

export type Insight = EconomyInsight | ITInsight;

/**
 * Type guards
 */
export function isEconomyInsight(insight: Insight): insight is EconomyInsight {
  return insight.domain === 'economy';
}

export function isITInsight(insight: Insight): insight is ITInsight {
  return insight.domain === 'it';
}
