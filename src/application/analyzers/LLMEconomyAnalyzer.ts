/**
 * LLM-based Economy News Analyzer using Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NewsArticle } from '../../domain/shared/types.js';
import type { EconomyInsight } from '../../domain/economy/types.js';
import { createEconomyInsight } from '../../domain/economy/entities.js';

export class LLMEconomyAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyze(articles: NewsArticle[]): Promise<EconomyInsight[]> {
    if (articles.length < 5) {
      console.log('[LLM Economy] Not enough articles, skipping analysis');
      return [];
    }

    console.log(`[LLM Economy] Analyzing ${articles.length} articles with Gemini...`);

    try {
      const insights: EconomyInsight[] = [];

      // 주제별로 분류
      const topics = this.classifyArticles(articles);

      // 각 주제별로 분석
      for (const [topic, topicArticles] of Object.entries(topics)) {
        if (topicArticles.length < 3) continue;

        console.log(`[LLM Economy] Analyzing ${topic} with ${topicArticles.length} articles...`);
        const insight = await this.analyzeTopicWithLLM(topic, topicArticles);

        if (insight) {
          insights.push(insight);
        }
      }

      console.log(`[LLM Economy] Generated ${insights.length} insights`);
      return insights;
    } catch (error) {
      console.error('[LLM Economy] Analysis failed:', error);
      return [];
    }
  }

  /**
   * 기사를 주제별로 분류 (키워드 기반 - 빠른 필터링)
   */
  private classifyArticles(articles: NewsArticle[]): Record<string, NewsArticle[]> {
    const topics: Record<string, NewsArticle[]> = {
      환율: [],
      금리: [],
      증시: [],
    };

    articles.forEach((article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();

      if (text.includes('환율') || text.includes('달러') || text.includes('원화')) {
        topics['환율']?.push(article);
      }
      if (text.includes('금리') || text.includes('기준금리') || text.includes('연준')) {
        topics['금리']?.push(article);
      }
      if (text.includes('증시') || text.includes('코스피') || text.includes('주가')) {
        topics['증시']?.push(article);
      }
    });

    return topics;
  }

  /**
   * LLM을 사용하여 주제 분석
   */
  private async analyzeTopicWithLLM(
    topic: string,
    articles: NewsArticle[]
  ): Promise<EconomyInsight | null> {
    const prompt = this.buildPrompt(topic, articles);

    try {
      console.log(`[LLM Economy] Requesting Gemini analysis for ${topic}...`);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log(`[LLM Economy] Received response (${text.length} chars)`);

      // JSON 파싱
      const analysis = this.parseAnalysis(text);

      if (!analysis) {
        console.error(`[LLM Economy] Failed to parse ${topic} analysis`);
        console.error(`[LLM Economy] Raw response:`, text.substring(0, 500));
        return null;
      }

      console.log(`[LLM Economy] Successfully parsed ${topic} analysis`);
      console.log(`[LLM Economy] Title: ${analysis.title}`);

      // Insight 생성
      const insight = createEconomyInsight({
        title: analysis.title,
        summary: analysis.summary,
        easyExplanation: analysis.easyExplanation,
        data: {
          issueType: this.mapTopicToIssueType(topic),
          event: analysis.event,
          causes: analysis.causes,
          effects: analysis.effects,
          direction: analysis.direction,
          metrics: analysis.metrics,
        },
        priority: analysis.priority,
        tags: analysis.tags,
        sourceUrls: articles.slice(0, 3).map((a) => a.link),
      });

      console.log(`[LLM Economy] Created insight for ${topic}`);
      return insight;
    } catch (error) {
      console.error(`[LLM Economy] Failed to analyze ${topic}:`, error);
      if (error instanceof Error) {
        console.error(`[LLM Economy] Error message:`, error.message);
      }
      return null;
    }
  }

  /**
   * 프롬프트 생성
   */
  private buildPrompt(topic: string, articles: NewsArticle[]): string {
    const newsList = articles.slice(0, 15).map((article, idx) => {
      return `[${idx + 1}] 제목: ${article.title}\n출처: ${article.source}\n내용: ${article.content.substring(0, 200)}...`;
    }).join('\n\n');

    return `당신은 경제 뉴스 분석 전문가입니다. 다음 ${topic} 관련 뉴스들을 분석하여 인사이트를 생성해주세요.

# 뉴스 목록
${newsList}

# 분석 요구사항
1. **제목**: "📌 {주제} {방향성}{핵심 키워드} [{주요 언론사}·{언론사2} 등 {총 건수}건]" 형식
   - 예: "📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 15건]"

2. **요약**: 2-3문장으로 전체 상황을 설명 (맥락과 영향 포함)

3. **쉬운 설명**: "💡 쉽게 이해하기" 형식으로 일반인도 이해할 수 있게 설명
   - 왜 이런 일이 일어났는지
   - 우리 생활에 어떤 영향을 미치는지
   - 실생활 예시 포함

4. **핵심 이벤트**: 무슨 일이 일어났는지 한 문장으로

5. **원인**: 왜 이런 일이 일어났는지 2-5개 항목 (구체적으로)

6. **영향**: 어떤 영향을 미칠지 2-5개 항목 (구체적으로)

7. **방향성**: "up" (상승), "down" (하락), "neutral" (중립) 중 하나

8. **주요 지표**: 핵심 수치가 있다면 추출 (예: "환율": "1,400원")

9. **우선순위**: "high", "medium", "low" 중 하나

10. **태그**: 관련 키워드 3-5개

# 출력 형식 (반드시 JSON으로만 응답)
\`\`\`json
{
  "title": "📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 15건]",
  "summary": "미국 금리 인상 기조와 중동 지정학적 리스크가 복합적으로 작용하면서 원-달러 환율이 1,400원을 돌파했습니다. 수출 기업들에게는 유리하지만 수입 물가 상승 압력이 커질 것으로 전망됩니다.",
  "easyExplanation": "💡 쉽게 이해하기\\n\\n달러 환율이 오른다는 것은 우리나라 돈의 가치가 떨어진다는 뜻입니다. 해외여행 비용이 늘고 수입 제품 가격이 오르지만, 수출 기업들은 해외에서 번 돈을 원화로 바꿀 때 더 많이 받게 됩니다. 주로 미국 금리가 오르면서 투자자들이 달러를 선호하게 된 것이 원인입니다.",
  "event": "원-달러 환율 1,400원 돌파",
  "causes": [
    "미국 연준의 긴축 기조 지속으로 달러 강세 심화",
    "중동 지정학적 리스크 증가로 안전자산 선호",
    "국내 무역수지 악화 우려"
  ],
  "effects": [
    "수입 물가 상승으로 인플레이션 압력 증가",
    "해외여행 경비 부담 증가",
    "수출 기업 수익성 개선 기대"
  ],
  "direction": "up",
  "metrics": {
    "환율": "1,400원",
    "전일대비": "+15원"
  },
  "priority": "high",
  "tags": ["환율", "달러", "경제", "수출", "수입물가"]
}
\`\`\`

반드시 위 JSON 형식으로만 응답하세요. 추가 설명 없이 JSON만 출력하세요.`;
  }

  /**
   * LLM 응답 파싱
   */
  private parseAnalysis(text: string): any | null {
    try {
      // JSON 블록 추출
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        console.error('[LLM Economy] No JSON found in response');
        return null;
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('[LLM Economy] JSON parse error:', error);
      console.error('[LLM Economy] Response text:', text);
      return null;
    }
  }

  /**
   * 주제를 IssueType으로 매핑
   */
  private mapTopicToIssueType(topic: string): any {
    const mapping: Record<string, string> = {
      환율: 'exchange_rate',
      금리: 'interest_rate',
      증시: 'equity_market',
    };
    return mapping[topic] || 'other';
  }
}
