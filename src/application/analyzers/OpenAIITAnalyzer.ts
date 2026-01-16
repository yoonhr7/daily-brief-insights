/**
 * OpenAI-based IT News Analyzer using GPT-4o-mini
 */

import OpenAI from 'openai';
import type { NewsArticle } from '../../domain/shared/types.js';
import type { ITInsight } from '../../domain/it/types.js';
import { createITInsight } from '../../domain/it/entities.js';

export class OpenAIITAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyze(articles: NewsArticle[]): Promise<ITInsight[]> {
    if (articles.length < 5) {
      console.log('[OpenAI IT] Not enough articles, skipping analysis');
      return [];
    }

    console.log(`[OpenAI IT] Analyzing ${articles.length} articles with GPT-4o-mini...`);

    try {
      const insights: ITInsight[] = [];

      // 주제별로 분류
      const topics = this.classifyArticles(articles);

      // 가장 핫한 이슈 3개 선정 (기사 수 기준)
      const topTopics = Object.entries(topics)
        .filter(([_, topicArticles]) => topicArticles.length >= 3)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);

      console.log('[OpenAI IT] Top 3 hottest topics:');
      topTopics.forEach(([topic, topicArticles]) => {
        console.log(`  - ${topic}: ${topicArticles.length} articles`);
      });

      // 각 주제별로 분석
      for (const [topic, topicArticles] of topTopics) {
        console.log(`[OpenAI IT] Analyzing ${topic} with ${topicArticles.length} articles...`);
        const insight = await this.analyzeTopicWithLLM(topic, topicArticles);

        if (insight) {
          insights.push(insight);
        }
      }

      console.log(`[OpenAI IT] Generated ${insights.length} insights`);
      return insights;
    } catch (error) {
      console.error('[OpenAI IT] Analysis failed:', error);
      return [];
    }
  }

  /**
   * 기사를 주제별로 분류 (키워드 기반 - 빠른 필터링)
   * 다양한 카테고리를 커버하여 가장 핫한 이슈를 찾습니다
   */
  private classifyArticles(articles: NewsArticle[]): Record<string, NewsArticle[]> {
    const topics: Record<string, NewsArticle[]> = {
      AI: [],
      제품출시: [],
      플랫폼: [],
      보안: [],
      클라우드: [],
      모바일: [],
      개발도구: [],
      규제: [],
      인수합병: [],
      반도체: [],
    };

    articles.forEach((article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();

      // AI
      if (text.includes('ai') || text.includes('인공지능') || text.includes('chatgpt') ||
          text.includes('llm') || text.includes('머신러닝') || text.includes('딥러닝')) {
        topics['AI']?.push(article);
      }
      // 제품출시
      if (text.includes('출시') || text.includes('공개') || text.includes('발표') ||
          text.includes('론칭') || text.includes('베타')) {
        topics['제품출시']?.push(article);
      }
      // 플랫폼
      if (text.includes('플랫폼') || text.includes('서비스') || text.includes('앱스토어') ||
          text.includes('유튜브') || text.includes('넷플릭스')) {
        topics['플랫폼']?.push(article);
      }
      // 보안
      if (text.includes('보안') || text.includes('해킹') || text.includes('취약점') ||
          text.includes('랜섬웨어') || text.includes('개인정보')) {
        topics['보안']?.push(article);
      }
      // 클라우드
      if (text.includes('클라우드') || text.includes('aws') || text.includes('azure') ||
          text.includes('서버') || text.includes('데이터센터')) {
        topics['클라우드']?.push(article);
      }
      // 모바일
      if (text.includes('모바일') || text.includes('스마트폰') || text.includes('아이폰') ||
          text.includes('안드로이드') || text.includes('갤럭시')) {
        topics['모바일']?.push(article);
      }
      // 개발도구
      if (text.includes('github') || text.includes('코드') || text.includes('프로그래밍') ||
          text.includes('개발자') || text.includes('오픈소스')) {
        topics['개발도구']?.push(article);
      }
      // 규제
      if (text.includes('규제') || text.includes('법안') || text.includes('정책') ||
          text.includes('제재') || text.includes('가이드라인')) {
        topics['규제']?.push(article);
      }
      // 인수합병
      if (text.includes('인수') || text.includes('합병') || text.includes('투자') ||
          text.includes('매각') || text.includes('펀딩')) {
        topics['인수합병']?.push(article);
      }
      // 반도체
      if (text.includes('반도체') || text.includes('칩') || text.includes('gpu') ||
          text.includes('cpu') || text.includes('파운드리')) {
        topics['반도체']?.push(article);
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
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 IT 뉴스 분석 전문가입니다. 뉴스를 분석하여 구조화된 인사이트를 JSON 형식으로 제공합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        console.error(`[OpenAI IT] Empty response for ${topic}`);
        return null;
      }

      // JSON 파싱
      const analysis = this.parseAnalysis(responseText);

      if (!analysis) {
        console.error(`[OpenAI IT] Failed to parse ${topic} analysis`);
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
      console.error(`[OpenAI IT] Failed to analyze ${topic}:`, error);
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

    return `당신은 IT 뉴스 분석 전문가입니다. 다음 ${topic} 관련 뉴스들을 분석하여 심층적인 인사이트를 생성해주세요.

# 뉴스 목록
${newsList}

# 분석 요구사항
1. **제목**: "📌 [{카테고리}] {핵심 키워드} [{주요 언론사}·{언론사2} 등 {총 건수}건]" 형식
   - 예: "📌 [AI] ChatGPT o1 모델 공개 [테크크런치·IT동아 등 12건]"

2. **요약**: 2-3문장으로 전체 상황을 설명 (기술의 의미와 영향 포함)

3. **쉬운 설명**: "💡 쉽게 이해하기" 형식으로 일반인도 이해할 수 있게 설명
   - **주요 용어 설명**: IT 전문 용어를 먼저 쉽게 설명 (예: "LLM(대규모 언어 모델)은...")
   - **이 기술이 무엇인지**: 핵심 개념을 비유나 예시로 설명
   - **왜 이런 변화가 일어났는지**: 기술적/비즈니스적 배경과 원인
   - **누구에게 어떤 영향이 있는지**: 개발자/기업/일반 사용자별로 구분하여 설명
   - **구체적인 예시**: 실제 사용 사례나 숫자로 표현

4. **변화 내용**: 무엇이 바뀌었는지 한 문장으로 명확하게

5. **시기**: 언제 적용되는지/영향을 미치는지

6. **영향 받는 대상**: ["developers", "users", "enterprises"] 중 해당되는 것 (복수 선택 가능)

7. **영향도**: "critical", "significant", "moderate", "low" 중 하나

8. **영향 설명**: 어떤 영향을 미칠지 구체적으로 (숫자, 비율, 구체적 사례 포함)

9. **액션 아이템**: 개발자/기업이 실제로 해야 할 일 3-5개 (구체적이고 실행 가능하게)
   - 예: "기존 API를 v2로 마이그레이션 (6개월 내)" (나쁜 예: "새 기술 학습")

10. **관련 기술**: 언급된 구체적인 기술 스택/프레임워크/도구

11. **우선순위**: "high", "medium", "low" 중 하나

12. **태그**: 관련 키워드 3-5개

# 출력 형식 (반드시 JSON으로만 응답)
{
  "title": "📌 [AI] ChatGPT o1 모델 공개 [테크크런치·IT동아 등 12건]",
  "summary": "OpenAI가 추론 능력이 강화된 ChatGPT o1 모델을 공개했습니다. 기존 GPT-4 대비 코딩, 수학, 과학 문제 해결 능력이 대폭 향상되어 개발자들의 업무 방식과 AI 활용 패턴이 크게 변화할 전망입니다.",
  "easyExplanation": "💡 쉽게 이해하기\\n\\n[용어 설명]\\n• LLM(대규모 언어 모델): 방대한 텍스트 데이터로 학습한 AI로, 사람처럼 글을 이해하고 생성할 수 있습니다.\\n• 추론(Reasoning): 단순히 문장을 생성하는 것을 넘어, 논리적으로 생각하고 문제를 단계적으로 해결하는 능력입니다.\\n\\n[왜 이런 변화가 일어났나요?]\\nOpenAI가 기존 ChatGPT의 한계였던 '복잡한 문제 해결 능력'을 개선하기 위해 새로운 학습 방법을 도입했습니다. 마치 사람이 문제를 풀 때 여러 단계로 생각하듯이, AI도 단계별로 추론하도록 훈련시켰죠.\\n\\n[누구에게 어떤 영향이 있나요?]\\n• 개발자: 복잡한 버그 찾기와 알고리즘 설계에서 30-40% 시간 단축 예상\\n• 기업: AI를 활용한 자동화 범위 확대 - 단순 작업을 넘어 복잡한 의사결정 지원 가능\\n• 일반 사용자: 더 정확한 답변과 전문가 수준의 조언 제공\\n\\n[구체적 예시]\\n기존 GPT-4는 '이 코드의 버그를 찾아줘'라고 하면 표면적인 오류만 찾았지만, o1 모델은 로직 전체를 분석하여 숨겨진 엣지 케이스까지 발견합니다. 실제 벤치마크에서 코딩 테스트 정확도가 71%에서 89%로 향상되었습니다.",
  "change": "OpenAI가 추론 능력을 강화한 ChatGPT o1 모델을 공개하여 복잡한 코딩과 수학 문제 해결 성능이 기존 대비 2-3배 향상",
  "timing": "2026년 1월 15일 공개, ChatGPT Plus 사용자에게 즉시 제공",
  "affected": ["developers", "enterprises", "users"],
  "impactLevel": "significant",
  "impactDescription": "개발자의 코딩 생산성 30-40% 향상, 복잡한 알고리즘 설계와 디버깅 시간 대폭 단축, AI 기반 코드 리뷰 품질 개선, 기업의 AI 자동화 범위 확대",
  "actionItems": [
    "ChatGPT o1 API 테스트 환경 구축 및 기존 GPT-4 대비 성능 비교 (1개월 내)",
    "복잡한 코드 리뷰와 알고리즘 최적화 업무에 o1 모델 우선 적용",
    "개발팀 대상 o1 모델 활용 가이드 작성 및 교육 실시 (2주 내)",
    "AI 코드 생성 품질 검증 프로세스 강화 - 테스트 커버리지 목표 80% 이상 유지",
    "기존 GPT-4 기반 자동화 파이프라인의 o1 마이그레이션 계획 수립"
  ],
  "technologies": ["ChatGPT o1", "OpenAI API", "GPT-4", "LLM", "AI Reasoning"],
  "priority": "high",
  "tags": ["AI", "ChatGPT", "OpenAI", "코딩", "생산성"]
}

반드시 위 JSON 형식으로만 응답하세요.`;
  }

  /**
   * LLM 응답 파싱
   */
  private parseAnalysis(text: string): any | null {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('[OpenAI IT] JSON parse error:', error);
      console.error('[OpenAI IT] Response text:', text);
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
