/**
 * IT Domain Types
 *
 * Core Question: What changed and WHY does it matter?
 * Analysis Style: Change → Impact
 */

import type { BaseInsight } from '../shared/types.js';

/**
 * IT change categories
 */
export type ITChangeType =
  | 'product_release'     // 제품 출시
  | 'policy_change'       // 정책/가격 변경
  | 'tech_adoption'       // 기술 도입
  | 'tech_deprecation'    // 기술 폐기
  | 'security'            // 보안 이슈
  | 'organization'        // 조직/사업 구조 변화
  | 'other';

/**
 * Impact level
 */
export type ImpactLevel = 'critical' | 'significant' | 'moderate' | 'minor';

/**
 * Who is affected?
 */
export type AffectedParty =
  | 'developers'
  | 'users'
  | 'enterprises'
  | 'all';

/**
 * IT-specific insight data
 */
export type ITInsightData = {
  changeType: ITChangeType;

  /**
   * What changed?
   */
  change: string;

  /**
   * Why now?
   */
  timing: string;

  /**
   * Who is affected?
   */
  affected: AffectedParty[];

  /**
   * Impact analysis
   */
  impact: {
    level: ImpactLevel;
    description: string;
  };

  /**
   * What should be done?
   */
  actionItems?: string[];

  /**
   * Technology stack mentioned
   */
  technologies?: string[];
};

/**
 * Complete IT Insight
 */
export type ITInsight = BaseInsight & {
  domain: 'it';
  data: ITInsightData;
};
