/**
 * Economy Domain Types
 *
 * Core Question: What happened and WHY did it happen?
 * Analysis Style: Cause → Effect
 */

import type { BaseInsight } from '../shared/types.js';

/**
 * Economy issue categories
 */
export type EconomyIssueType =
  | 'exchange_rate'   // 환율
  | 'interest_rate'   // 금리
  | 'equity_market'   // 증시
  | 'commodity'       // 원자재
  | 'policy'          // 정책
  | 'other';

/**
 * Market direction indicators
 */
export type MarketDirection = 'up' | 'down' | 'neutral';

/**
 * Economy-specific insight data
 */
export type EconomyInsightData = {
  issueType: EconomyIssueType;

  /**
   * What happened?
   */
  event: string;

  /**
   * Why did it happen?
   * Array of causal factors
   */
  causes: string[];

  /**
   * What are the effects?
   */
  effects: string[];

  /**
   * Market direction (if applicable)
   */
  direction?: MarketDirection;

  /**
   * Key metrics or numbers
   */
  metrics?: Record<string, string | number>;
};

/**
 * Complete Economy Insight
 */
export type EconomyInsight = BaseInsight & {
  domain: 'economy';
  data: EconomyInsightData;
};
