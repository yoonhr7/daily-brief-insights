/**
 * KakaoTalk Notification Service Implementation
 * Uses KakaoTalk REST API to send messages to self
 */

import type { NotificationService } from '../../domain/shared/repositories.js';
import type { Insight } from '../../domain/shared/insight.js';
import { isEconomyInsight, isITInsight } from '../../domain/shared/insight.js';

type KakaoConfig = {
  restApiKey: string;
  accessToken: string;
};

export class KakaoNotificationService implements NotificationService {
  private config: KakaoConfig;
  private readonly apiUrl = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';

  constructor(config: KakaoConfig) {
    this.config = config;
  }

  async send(insight: Insight): Promise<void> {
    const message = this.formatInsightMessage(insight);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: new URLSearchParams({
          template_object: JSON.stringify(message),
        }),
      });

      if (!response.ok) {
        throw new Error(`KakaoTalk API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send KakaoTalk message:', error);
      throw new Error('Failed to send KakaoTalk notification');
    }
  }

  async sendBatch(insights: Insight[]): Promise<void> {
    // Send one summary message with all insights
    const summary = this.formatBatchMessage(insights);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: new URLSearchParams({
          template_object: JSON.stringify(summary),
        }),
      });

      if (!response.ok) {
        throw new Error(`KakaoTalk API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send KakaoTalk batch message:', error);
      throw new Error('Failed to send KakaoTalk batch notification');
    }
  }

  /**
   * Format single insight as KakaoTalk text message template
   */
  private formatInsightMessage(insight: Insight): Record<string, unknown> {
    const domainEmoji = insight.domain === 'economy' ? '💰' : '💻';
    const priorityEmoji =
      insight.priority === 'high' ? '🔴' : insight.priority === 'medium' ? '🟡' : '⚪';

    let content = `${domainEmoji} ${insight.title}\n\n`;
    content += `${insight.summary}\n\n`;

    if (isEconomyInsight(insight)) {
      content += `📊 이슈: ${insight.data.event}\n`;
      content += `📍 원인:\n${insight.data.causes.map((c) => `  • ${c}`).join('\n')}\n`;
      if (insight.data.effects.length > 0) {
        content += `📈 영향:\n${insight.data.effects.map((e) => `  • ${e}`).join('\n')}\n`;
      }
    } else if (isITInsight(insight)) {
      content += `🔄 변화: ${insight.data.change}\n`;
      content += `⏰ 시점: ${insight.data.timing}\n`;
      content += `👥 대상: ${insight.data.affected.join(', ')}\n`;
      content += `💥 영향: ${insight.data.impact.description}\n`;
      if (insight.data.actionItems && insight.data.actionItems.length > 0) {
        content += `✅ 액션:\n${insight.data.actionItems.map((a) => `  • ${a}`).join('\n')}\n`;
      }
    }

    content += `\n${priorityEmoji} 우선순위: ${insight.priority}`;

    return {
      object_type: 'text',
      text: content,
      link: {
        web_url: 'https://www.notion.so',
        mobile_web_url: 'https://www.notion.so',
      },
    };
  }

  /**
   * Format batch of insights as summary message
   */
  private formatBatchMessage(insights: Insight[]): Record<string, unknown> {
    const economyCount = insights.filter((i) => i.domain === 'economy').length;
    const itCount = insights.filter((i) => i.domain === 'it').length;

    let content = `📰 Daily Brief Insights\n`;
    content += `${new Date().toLocaleDateString('ko-KR')}\n\n`;
    content += `💰 경제: ${economyCount}건\n`;
    content += `💻 IT: ${itCount}건\n\n`;
    content += `총 ${insights.length}개의 인사이트가 분석되었습니다.\n\n`;

    // Add top 3 insights
    const topInsights = insights.slice(0, 3);
    content += `주요 인사이트:\n`;
    topInsights.forEach((insight, index) => {
      const emoji = insight.domain === 'economy' ? '💰' : '💻';
      content += `${index + 1}. ${emoji} ${insight.title}\n`;
    });

    return {
      object_type: 'text',
      text: content,
      link: {
        web_url: 'https://www.notion.so',
        mobile_web_url: 'https://www.notion.so',
      },
    };
  }

  /**
   * Factory method to create instance from environment variables
   */
  static fromEnv(): KakaoNotificationService {
    const restApiKey = process.env['KAKAO_REST_API_KEY'];
    const accessToken = process.env['KAKAO_ACCESS_TOKEN'];

    if (!restApiKey || !accessToken) {
      throw new Error('KAKAO_REST_API_KEY and KAKAO_ACCESS_TOKEN must be set');
    }

    return new KakaoNotificationService({
      restApiKey,
      accessToken,
    });
  }
}
