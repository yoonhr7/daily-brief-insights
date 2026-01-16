/**
 * OpenAI-based Economy News Analyzer using GPT-4o-mini
 */

import OpenAI from 'openai';
import type { NewsArticle } from '../../domain/shared/types.js';
import type { EconomyInsight } from '../../domain/economy/types.js';
import { createEconomyInsight } from '../../domain/economy/entities.js';

export class OpenAIEconomyAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyze(articles: NewsArticle[]): Promise<EconomyInsight[]> {
    if (articles.length < 5) {
      console.log('[OpenAI Economy] Not enough articles, skipping analysis');
      return [];
    }

    console.log(`[OpenAI Economy] Analyzing ${articles.length} articles with GPT-4o-mini...`);

    try {
      const insights: EconomyInsight[] = [];

      // 주제별로 분류
      const topics = this.classifyArticles(articles);

      // 가장 핫한 이슈 3개 선정 (기사 수 기준)
      const topTopics = Object.entries(topics)
        .filter(([_, topicArticles]) => topicArticles.length >= 3)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);

      console.log('[OpenAI Economy] Top 3 hottest topics:');
      topTopics.forEach(([topic, topicArticles]) => {
        console.log(`  - ${topic}: ${topicArticles.length} articles`);
      });

      // 각 주제별로 분석
      for (const [topic, topicArticles] of topTopics) {
        console.log(`[OpenAI Economy] Analyzing ${topic} with ${topicArticles.length} articles...`);
        const insight = await this.analyzeTopicWithLLM(topic, topicArticles);

        if (insight) {
          insights.push(insight);
        }
      }

      console.log(`[OpenAI Economy] Generated ${insights.length} insights`);
      return insights;
    } catch (error) {
      console.error('[OpenAI Economy] Analysis failed:', error);
      return [];
    }
  }

  /**
   * 기사를 주제별로 분류 (키워드 기반 - 빠른 필터링)
   * 다양한 카테고리를 커버하여 가장 핫한 이슈를 찾습니다
   */
  private classifyArticles(articles: NewsArticle[]): Record<string, NewsArticle[]> {
    const topics: Record<string, NewsArticle[]> = {
      환율: [],
      금리: [],
      증시: [],
      부동산: [],
      물가: [],
      고용: [],
      무역: [],
      에너지: [],
      기업실적: [],
      정책: [],
    };

    articles.forEach((article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();

      // 환율
      if (text.includes('환율') || text.includes('달러') || text.includes('원화') ||
          text.includes('위안') || text.includes('엔화')) {
        topics['환율']?.push(article);
      }
      // 금리
      if (text.includes('금리') || text.includes('기준금리') || text.includes('연준') ||
          text.includes('한은') || text.includes('금융통화위')) {
        topics['금리']?.push(article);
      }
      // 증시
      if (text.includes('증시') || text.includes('코스피') || text.includes('주가') ||
          text.includes('나스닥') || text.includes('다우') || text.includes('상장')) {
        topics['증시']?.push(article);
      }
      // 부동산
      if (text.includes('부동산') || text.includes('집값') || text.includes('아파트') ||
          text.includes('전세') || text.includes('매매') || text.includes('분양')) {
        topics['부동산']?.push(article);
      }
      // 물가
      if (text.includes('물가') || text.includes('인플레') || text.includes('cpi') ||
          text.includes('소비자물가') || text.includes('유가')) {
        topics['물가']?.push(article);
      }
      // 고용
      if (text.includes('고용') || text.includes('실업') || text.includes('취업') ||
          text.includes('채용') || text.includes('일자리')) {
        topics['고용']?.push(article);
      }
      // 무역
      if (text.includes('무역') || text.includes('수출') || text.includes('수입') ||
          text.includes('관세') || text.includes('무역수지')) {
        topics['무역']?.push(article);
      }
      // 에너지
      if (text.includes('에너지') || text.includes('전기') || text.includes('원유') ||
          text.includes('배터리') || text.includes('재생에너지')) {
        topics['에너지']?.push(article);
      }
      // 기업실적
      if (text.includes('실적') || text.includes('영업이익') || text.includes('매출') ||
          text.includes('분기') || text.includes('어닝')) {
        topics['기업실적']?.push(article);
      }
      // 정책
      if (text.includes('정책') || text.includes('법안') || text.includes('규제') ||
          text.includes('세금') || text.includes('예산')) {
        topics['정책']?.push(article);
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
      console.log(`[OpenAI Economy] Requesting GPT-4o-mini analysis for ${topic}...`);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 경제 뉴스 분석 전문가입니다. 뉴스를 분석하여 구조화된 인사이트를 JSON 형식으로 제공합니다.'
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
        console.error(`[OpenAI Economy] Empty response for ${topic}`);
        return null;
      }

      console.log(`[OpenAI Economy] Received response (${responseText.length} chars)`);

      // JSON 파싱
      const analysis = this.parseAnalysis(responseText);

      if (!analysis) {
        console.error(`[OpenAI Economy] Failed to parse ${topic} analysis`);
        console.error(`[OpenAI Economy] Raw response:`, responseText.substring(0, 500));
        return null;
      }

      console.log(`[OpenAI Economy] Successfully parsed ${topic} analysis`);
      console.log(`[OpenAI Economy] Title: ${analysis.title}`);

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

      console.log(`[OpenAI Economy] Created insight for ${topic}`);
      return insight;
    } catch (error) {
      console.error(`[OpenAI Economy] Failed to analyze ${topic}:`, error);
      if (error instanceof Error) {
        console.error(`[OpenAI Economy] Error message:`, error.message);
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

    return `당신은 경제 뉴스 분석 전문가입니다. 다음 ${topic} 관련 뉴스들을 분석하여 심층적인 인사이트를 생성해주세요.

# 뉴스 목록
${newsList}

# 분석 요구사항
1. **제목**: "📌 {주제} {방향성}{핵심 키워드} [{주요 언론사}·{언론사2} 등 {총 건수}건]" 형식
   - 예: "📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 15건]"

2. **요약**: 2-3문장으로 전체 상황을 설명 (맥락과 영향 포함)

3. **쉬운 설명**: "💡 쉽게 이해하기" 형식으로 일반인도 이해할 수 있게 설명
   - **주요 용어 설명**: 전문 용어가 있다면 먼저 쉽게 설명 (예: "기준금리란 한국은행이 정하는 기본 금리로...")
   - **왜 이런 일이 일어났는지**: 직접적인 원인과 배경
   - **우리 생활에 어떤 영향을 미치는지**: 구체적인 실생활 영향
   - **실생활 예시**: 숫자로 표현 (예: "100만원 대출 시 월 이자 5,000원 증가")

4. **핵심 이벤트**: 무슨 일이 일어났는지 한 문장으로

5. **원인 분석** (매우 중요!): 근본 원인을 심층적으로 분석
   - **직접적 원인**: 바로 이어진 원인 (예: "미국 연준의 금리 인상")
   - **구조적 원인**: 시스템적/장기적 배경 (예: "글로벌 인플레이션 압력")
   - **연쇄 효과**: 원인들이 서로 어떻게 연결되는지 (예: "미국 금리 상승 → 달러 강세 → 원화 약세")
   - **데이터 근거**: 구체적인 수치나 비율 포함
   - 최소 3-5개 항목, 각 항목은 구체적이고 분석적이어야 함

6. **영향**: 어떤 영향을 미칠지 3-5개 항목 (구체적으로, 누구에게/어떻게/얼마나)

7. **방향성**: "up" (상승), "down" (하락), "neutral" (중립) 중 하나

8. **주요 지표**: 핵심 수치가 있다면 추출 (예: "환율": "1,400원")

9. **우선순위**: "high", "medium", "low" 중 하나

10. **태그**: 관련 키워드 3-5개

# 출력 형식 (반드시 JSON으로만 응답)
{
  "title": "📌 환율 상승세, 1,400원 돌파 [연합뉴스·KBS 등 15건]",
  "summary": "미국 연준의 긴축 통화정책과 중동 지정학적 리스크가 복합적으로 작용하면서 원-달러 환율이 1,400원을 돌파했습니다. 수출 기업들에게는 유리하지만 수입 물가 상승 압력이 커질 것으로 전망됩니다.",
  "easyExplanation": "💡 쉽게 이해하기\\n\\n[용어 설명]\\n• 환율: 다른 나라 돈을 우리 돈으로 바꿀 때의 비율입니다. 원-달러 환율 1,400원은 1달러를 사려면 1,400원이 필요하다는 뜻이에요.\\n• 기준금리: 한국은행이 정하는 기본 금리로, 이것이 오르면 예금 금리와 대출 금리도 함께 오릅니다.\\n\\n[왜 환율이 올랐나요?]\\n미국이 물가를 잡기 위해 금리를 올리자, 전 세계 투자자들이 '이자를 더 받을 수 있는' 달러로 돈을 옮기고 있습니다. 달러를 사려는 사람이 많아지면서 달러 값이 오르는 것이죠.\\n\\n[내 생활에 어떤 영향이 있나요?]\\n• 해외여행: 100만원으로 살 수 있는 달러가 약 50달러 줄어듭니다\\n• 수입 제품: 아이폰, 명품 가방 등 수입 제품 가격이 5-10% 오를 수 있어요\\n• 수출 기업: 삼성전자 같은 수출 기업의 실적은 좋아지지만, 원자재를 수입하는 기업은 어려워집니다",
  "event": "원-달러 환율이 1,400원을 돌파하며 2개월 만에 최고치 기록",
  "causes": [
    "[직접 원인] 미국 연준의 기준금리 5.5% 유지 발표 - 높은 금리가 지속되면서 달러 자산 선호 현상 심화",
    "[구조적 원인] 글로벌 인플레이션 장기화 - 미국 소비자물가지수(CPI) 3.2% 유지로 금리 인하 시기 불투명",
    "[연쇄 효과] 미국 금리 ↑ → 달러 투자 수익률 증가 → 신흥국에서 달러로 자금 이동 → 원화 가치 하락",
    "[지정학적 리스크] 중동 긴장 고조로 안전자산(달러) 선호 현상 - 국제 유가 7% 상승이 환율 상승 압력으로 작용",
    "[국내 요인] 한국 무역수지 3개월 연속 적자 지속 - 에너지 수입 증가로 달러 수요 확대"
  ],
  "effects": [
    "가계: 수입 제품 가격 5-10% 상승, 해외여행 비용 10-15% 증가, 유학생 학비 부담 가중",
    "기업: 수출 대기업(삼성, 현대차) 영업이익 10% 증가 예상, 수입 원자재 의존 중소기업 마진 악화",
    "물가: 수입 인플레이션으로 소비자물가 0.3-0.5%p 추가 상승 압력, 특히 식료품·에너지 가격 상승",
    "금융시장: 외국인 주식 투자 감소, 채권 시장 변동성 확대, 환헷지 비용 증가",
    "정책: 한국은행 금리 인하 시기 지연 가능성, 정부 환율 안정화 개입 검토"
  ],
  "direction": "up",
  "metrics": {
    "현재 환율": "1,400원",
    "전일 대비": "+15원 (1.08%)",
    "2개월 전 대비": "+80원 (6.1%)",
    "미국 금리": "5.5%"
  },
  "priority": "high",
  "tags": ["환율", "달러", "금리", "무역수지", "수입물가"]
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
      console.error('[OpenAI Economy] JSON parse error:', error);
      console.error('[OpenAI Economy] Response text:', text);
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
