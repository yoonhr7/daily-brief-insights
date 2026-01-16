/**
 * LLM-based IT News Analyzer using Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NewsArticle } from '../../domain/shared/types.js';
import type { ITInsight } from '../../domain/it/types.js';
import { createITInsight } from '../../domain/it/entities.js';

export class LLMITAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyze(articles: NewsArticle[]): Promise<ITInsight[]> {
    if (articles.length < 5) {
      console.log('[LLM IT] Not enough articles, skipping analysis');
      return [];
    }

    console.log(`[LLM IT] Analyzing ${articles.length} articles with Gemini...`);

    try {
      const insights: ITInsight[] = [];

      // 주제별로 분류
      const topics = this.classifyArticles(articles);

      // 각 주제별로 분석
      for (const [topic, topicArticles] of Object.entries(topics)) {
        if (topicArticles.length < 3) continue;

        console.log(`[LLM IT] Analyzing ${topic} with ${topicArticles.length} articles...`);
        const insight = await this.analyzeTopicWithLLM(topic, topicArticles);

        if (insight) {
          insights.push(insight);
        }
      }

      console.log(`[LLM IT] Generated ${insights.length} insights`);
      return insights;
    } catch (error) {
      console.error('[LLM IT] Analysis failed:', error);
      return [];
    }
  }

  /**
   * 기사를 주제별로 분류 (키워드 기반 - 빠른 필터링)
   */
  private classifyArticles(articles: NewsArticle[]): Record<string, NewsArticle[]> {
    const topics: Record<string, NewsArticle[]> = {
      제품출시: [],
      기술변화: [],
      보안: [],
    };

    articles.forEach((article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();

      if (text.includes('출시') || text.includes('공개') || text.includes('발표')) {
        topics['제품출시']?.push(article);
      }
      if (text.includes('ai') || text.includes('기술') || text.includes('개발')) {
        topics['기술변화']?.push(article);
      }
      if (text.includes('보안') || text.includes('해킹') || text.includes('취약점')) {
        topics['보안']?.push(article);
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
  ): Promise<ITInsight | null> {
    const prompt = this.buildPrompt(topic, articles);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // JSON 파싱
      const analysis = this.parseAnalysis(text);

      if (!analysis) {
        console.error(`[LLM IT] Failed to parse ${topic} analysis`);
        return null;
      }

      // Insight 생성
      return createITInsight({
        title: analysis.title,
        summary: analysis.summary,
        easyExplanation: analysis.easyExplanation,
        data: {
          changeType: this.mapTopicToChangeType(topic),
          change: analysis.change,
          timing: analysis.timing,
          affected: analysis.affected,
          impact: {
            level: analysis.impactLevel,
            description: analysis.impactDescription,
          },
          actionItems: analysis.actionItems,
          technologies: analysis.technologies,
        },
        priority: analysis.priority,
        tags: analysis.tags,
        sourceUrls: articles.slice(0, 3).map((a) => a.link),
      });
    } catch (error) {
      console.error(`[LLM IT] Failed to analyze ${topic}:`, error);
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

    return `당신은 IT 뉴스 분석 전문가입니다. 다음 ${topic} 관련 뉴스들을 분석하여 인사이트를 생성해주세요.

# 뉴스 목록
${newsList}

# 분석 요구사항
1. **제목**: "📌 [{카테고리}] {핵심 키워드} [{주요 언론사}·{언론사2} 등 {총 건수}건]" 형식
   - 예: "📌 [제품] ChatGPT 업데이트 [테크크런치·IT동아 등 12건]"

2. **요약**: 2-3문장으로 전체 상황을 설명 (기술의 의미와 영향 포함)

3. **쉬운 설명**: "💡 쉽게 이해하기" 형식으로 일반인도 이해할 수 있게 설명
   - 이 기술이 무엇인지
   - 왜 중요한지
   - 개발자/기업/사용자에게 어떤 영향이 있는지

4. **변화 내용**: 무엇이 바뀌었는지 한 문장으로

5. **시기**: 언제 적용되는지/영향을 미치는지

6. **영향 받는 대상**: ["developers", "users", "enterprises"] 중 해당되는 것

7. **영향도**: "critical", "significant", "moderate", "low" 중 하나

8. **영향 설명**: 어떤 영향을 미칠지 구체적으로

9. **액션 아이템**: 개발자/기업이 해야 할 일 2-5개

10. **관련 기술**: 언급된 기술 스택

11. **우선순위**: "high", "medium", "low" 중 하나

12. **태그**: 관련 키워드 3-5개

# 출력 형식 (반드시 JSON으로만 응답)
\`\`\`json
{
  "title": "📌 [제품] ChatGPT 업데이트 [테크크런치·IT동아 등 12건]",
  "summary": "OpenAI가 ChatGPT의 새로운 기능을 발표했습니다. AI 기반 개발 도구들이 빠르게 발전하면서 개발자들의 업무 방식이 변화하고 있으며, 생산성 향상과 함께 새로운 스킬 요구사항이 생겨나고 있습니다.",
  "easyExplanation": "💡 쉽게 이해하기\\n\\nAI 기반 개발 도구가 업데이트되었습니다. 이런 도구들은 개발자가 코드를 작성할 때 자동으로 다음 코드를 제안하거나 버그를 찾아줍니다. 개발자는 반복적인 작업은 AI에게 맡기고 더 창의적인 문제 해결에 집중할 수 있게 됩니다. 다만 AI가 제안한 코드를 이해하고 검토하는 능력이 여전히 중요합니다.",
  "change": "ChatGPT에 새로운 코드 분석 기능 추가",
  "timing": "2026년 1월부터 순차 적용",
  "affected": ["developers", "enterprises"],
  "impactLevel": "significant",
  "impactDescription": "개발 생산성 향상과 함께 AI 활용 능력이 핵심 역량으로 부상",
  "actionItems": [
    "새로운 AI 도구 학습 및 업무 프로세스 통합",
    "AI 생성 코드 검토 및 품질 관리 프로세스 수립",
    "팀 내 AI 활용 교육 프로그램 마련"
  ],
  "technologies": ["ChatGPT", "AI", "GPT-4"],
  "priority": "high",
  "tags": ["AI", "개발도구", "생산성", "ChatGPT"]
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
        console.error('[LLM IT] No JSON found in response');
        return null;
      }

      const jsonText = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('[LLM IT] JSON parse error:', error);
      console.error('[LLM IT] Response text:', text);
      return null;
    }
  }

  /**
   * 주제를 ChangeType으로 매핑
   */
  private mapTopicToChangeType(topic: string): any {
    const mapping: Record<string, string> = {
      제품출시: 'product_release',
      기술변화: 'tech_adoption',
      보안: 'security',
    };
    return mapping[topic] || 'other';
  }
}
