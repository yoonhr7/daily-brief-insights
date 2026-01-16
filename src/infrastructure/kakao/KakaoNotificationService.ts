/**
 * KakaoTalk Notification Service Implementation
 * Uses KakaoTalk REST API to send messages to self
 */

import type { NotificationService } from '../../domain/shared/repositories.js';
import type { Insight } from '../../domain/shared/insight.js';
import { isEconomyInsight, isITInsight } from '../../domain/shared/insight.js';

type KakaoTokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  refresh_token_expires_in?: number;
};

type KakaoErrorResponse = {
  error: string;
  error_description: string;
};

type KakaoConfig = {
  restApiKey: string;
  accessToken: string;
  refreshToken: string;
};

export class KakaoNotificationService implements NotificationService {
  private config: KakaoConfig;
  private readonly apiUrl = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';

  constructor(config: KakaoConfig) {
    this.config = config;
  }

  async send(insight: Insight): Promise<void> {
    const message = this.formatInsightMessage(insight);
    await this._request(message);
  }

  async sendBatch(insights: Insight[]): Promise<void> {
    const summary = this.formatBatchMessage(insights);
    await this._request(summary);
  }

  /**
   * General request method with token refresh logic
   * @param templateObject The message template object to send
   * @param retryCount Internal counter for retries
   */
  private async _request(
    templateObject: Record<string, unknown>,
    retryCount = 0
  ): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: new URLSearchParams({
          template_object: JSON.stringify(templateObject),
        }),
      });

      if (!response.ok) {
        // If unauthorized and it's the first attempt, try to refresh token
        if (response.status === 401 && retryCount === 0) {
          console.log(
            '[KakaoNotificationService] Access token expired, attempting to refresh...'
          );
          await this._refreshToken();
          // Retry the request with the new token
          return this._request(templateObject, retryCount + 1);
        }
        throw new Error(
          `KakaoTalk API error: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('Failed to send KakaoTalk message:', error);
      throw new Error('Failed to send KakaoTalk notification');
    }
  }

  /**
   * Refresh the KakaoTalk access token using the refresh token
   */
  private async _refreshToken(): Promise<void> {
    try {
      const response = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.restApiKey,
          refresh_token: this.config.refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as KakaoErrorResponse;
        throw new Error(
          `Failed to refresh KakaoTalk token: ${response.status} ${response.statusText} - ${errorData.error_description}`
        );
      }

      const data = (await response.json()) as KakaoTokenResponse;
      this.config.accessToken = data.access_token;
      console.log('[KakaoNotificationService] Access token refreshed successfully.');

      // If Kakao returns a new refresh token (rotating refresh token), update it
      if (data.refresh_token) {
        this.config.refreshToken = data.refresh_token;
        console.log(
          '[KakaoNotificationService] Refresh token updated successfully.'
        );
      }
    } catch (error) {
      console.error('Error refreshing KakaoTalk token:', error);
      throw new Error('Failed to refresh KakaoTalk access token');
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
    const refreshToken = process.env['KAKAO_REFRESH_TOKEN'];

    if (!restApiKey || !accessToken || !refreshToken) {
      throw new Error(
        'KAKAO_REST_API_KEY, KAKAO_ACCESS_TOKEN, and KAKAO_REFRESH_TOKEN must be set'
      );
    }

    return new KakaoNotificationService({
      restApiKey,
      accessToken,
      refreshToken,
    });
  }
}
