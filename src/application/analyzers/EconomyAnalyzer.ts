/**
 * Economy News Analyzer
 * 경제 뉴스를 분석하여 인사이트 생성 (Rule-based)
 */

import type { NewsArticle } from '../../domain/shared/types.js';
import type { EconomyInsight } from '../../domain/economy/types.js';
import { createEconomyInsight } from '../../domain/economy/entities.js';
import type { MarketDirection } from '../../domain/economy/types.js';

export class EconomyAnalyzer {
  /**
   * 뉴스 배열을 분석하여 인사이트 생성
   */
  analyze(articles: NewsArticle[]): EconomyInsight[] {
    // 뉴스가 5개 미만이면 분석하지 않음
    if (articles.length < 5) {
      return [];
    }

    const insights: EconomyInsight[] = [];

    // 환율 관련 인사이트
    const exchangeRateInsight = this.analyzeExchangeRate(articles);
    if (exchangeRateInsight) {
      insights.push(exchangeRateInsight);
    }

    // 금리 관련 인사이트
    const interestRateInsight = this.analyzeInterestRate(articles);
    if (interestRateInsight) {
      insights.push(interestRateInsight);
    }

    // 증시 관련 인사이트
    const stockMarketInsight = this.analyzeStockMarket(articles);
    if (stockMarketInsight) {
      insights.push(stockMarketInsight);
    }

    return insights;
  }

  /**
   * 환율 관련 뉴스 분석
   */
  private analyzeExchangeRate(articles: NewsArticle[]): EconomyInsight | null {
    const keywords = ['환율', '달러', '원화', '엔화', '위안화', '유로'];
    const relevantArticles = this.filterByKeywords(articles, keywords);

    if (relevantArticles.length < 3) {
      return null;
    }

    // 방향성 분석
    const direction = this.detectDirection(relevantArticles);

    // 원인 추출
    const causes = this.extractDetailedCauses(relevantArticles, [
      '미국 금리',
      '연준',
      'Fed',
      '중동',
      '지정학',
      '경상수지',
      '무역수지',
      '중국 경기',
    ]);

    // 영향 추출
    const effects = this.extractDetailedEffects(relevantArticles, [
      '수입 물가',
      '수출 기업',
      '외화 부채',
      '해외여행',
      '물가',
      '인플레이션',
    ]);

    return createEconomyInsight({
      title: this.generateTitle('환율', direction, relevantArticles),
      summary: this.generateEnhancedSummary(relevantArticles, '환율', direction),
      easyExplanation: this.generateEasyExplanation('exchange_rate', direction, relevantArticles),
      data: {
        issueType: 'exchange_rate',
        event: this.extractMainEvent(relevantArticles),
        causes: causes.length > 0 ? causes : ['환율 변동성이 증가하고 있습니다'],
        effects: effects.length > 0 ? effects : ['경제 전반에 걸쳐 영향을 미칠 것으로 예상됩니다'],
        direction,
      },
      priority: this.calculatePriority(relevantArticles.length, direction),
      tags: ['환율', '달러', '경제'],
      sourceUrls: relevantArticles.slice(0, 3).map((a) => a.link),
    });
  }

  /**
   * 금리 관련 뉴스 분석
   */
  private analyzeInterestRate(articles: NewsArticle[]): EconomyInsight | null {
    const keywords = ['금리', '기준금리', '연준', 'Fed', '한국은행', '통화정책'];
    const relevantArticles = this.filterByKeywords(articles, keywords);

    if (relevantArticles.length < 3) {
      return null;
    }

    const direction = this.detectDirection(relevantArticles);

    const causes = this.extractDetailedCauses(relevantArticles, [
      '인플레이션',
      '물가',
      '경기',
      '고용',
      '성장률',
    ]);

    const effects = this.extractDetailedEffects(relevantArticles, [
      '대출',
      '예금',
      '부동산',
      '주식',
      '투자',
      '소비',
    ]);

    return createEconomyInsight({
      title: this.generateTitle('금리', direction, relevantArticles),
      summary: this.generateEnhancedSummary(relevantArticles, '금리', direction),
      easyExplanation: this.generateEasyExplanation('interest_rate', direction, relevantArticles),
      data: {
        issueType: 'interest_rate',
        event: this.extractMainEvent(relevantArticles),
        causes: causes.length > 0 ? causes : ['통화정책 변화가 나타나고 있습니다'],
        effects: effects.length > 0 ? effects : ['금융시장 전반에 영향을 미칠 것으로 보입니다'],
        direction,
      },
      priority: this.calculatePriority(relevantArticles.length, direction),
      tags: ['금리', '통화정책', '경제'],
      sourceUrls: relevantArticles.slice(0, 3).map((a) => a.link),
    });
  }

  /**
   * 증시 관련 뉴스 분석
   */
  private analyzeStockMarket(articles: NewsArticle[]): EconomyInsight | null {
    const keywords = ['증시', '주가', '코스피', 'KOSPI', '코스닥', '나스닥', 'S&P'];
    const relevantArticles = this.filterByKeywords(articles, keywords);

    if (relevantArticles.length < 3) {
      return null;
    }

    const direction = this.detectDirection(relevantArticles);

    const causes = this.extractDetailedCauses(relevantArticles, [
      '실적',
      '경기',
      '금리',
      '외국인',
      '기관',
      '반도체',
      '기술주',
    ]);

    const effects = this.extractDetailedEffects(relevantArticles, [
      '투자자',
      '개인',
      '기업가치',
      '시가총액',
      '자산',
    ]);

    return createEconomyInsight({
      title: this.generateTitle('증시', direction, relevantArticles),
      summary: this.generateEnhancedSummary(relevantArticles, '증시', direction),
      easyExplanation: this.generateEasyExplanation('equity_market', direction, relevantArticles),
      data: {
        issueType: 'equity_market',
        event: this.extractMainEvent(relevantArticles),
        causes: causes.length > 0 ? causes : ['시장 변동성이 증가하고 있습니다'],
        effects: effects.length > 0 ? effects : ['투자 심리에 영향을 미칠 것으로 보입니다'],
        direction,
      },
      priority: this.calculatePriority(relevantArticles.length, direction),
      tags: ['증시', '주식', '투자'],
      sourceUrls: relevantArticles.slice(0, 3).map((a) => a.link),
    });
  }

  /**
   * 키워드로 뉴스 필터링
   */
  private filterByKeywords(articles: NewsArticle[], keywords: string[]): NewsArticle[] {
    return articles.filter((article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();
      return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    });
  }

  /**
   * 방향성 감지 (상승/하락/중립)
   */
  private detectDirection(articles: NewsArticle[]): MarketDirection {
    const upWords = ['상승', '급등', '오름', '증가', '강세', '호조', '플러스'];
    const downWords = ['하락', '급락', '떨어', '감소', '약세', '부진', '마이너스'];

    let upCount = 0;
    let downCount = 0;

    articles.forEach((article) => {
      const text = `${article.title} ${article.content}`;
      upWords.forEach((word) => {
        if (text.includes(word)) upCount++;
      });
      downWords.forEach((word) => {
        if (text.includes(word)) downCount++;
      });
    });

    if (upCount > downCount * 1.5) return 'up';
    if (downCount > upCount * 1.5) return 'down';
    return 'neutral';
  }

  /**
   * 원인 추출 (상세)
   */
  private extractDetailedCauses(articles: NewsArticle[], keywords: string[]): string[] {
    const causes: string[] = [];

    keywords.forEach((keyword) => {
      const found = articles.find((a) =>
        `${a.title} ${a.content}`.includes(keyword)
      );
      if (found) {
        causes.push(`${keyword} 관련 요인으로 인한 영향이 나타나고 있습니다`);
      }
    });

    return causes.slice(0, 5); // 최대 5개
  }

  /**
   * 영향 추출 (상세)
   */
  private extractDetailedEffects(articles: NewsArticle[], keywords: string[]): string[] {
    const effects: string[] = [];

    keywords.forEach((keyword) => {
      const found = articles.find((a) =>
        `${a.title} ${a.content}`.includes(keyword)
      );
      if (found) {
        effects.push(`${keyword}에 상당한 영향을 미칠 것으로 예상됩니다`);
      }
    });

    return effects.slice(0, 5); // 최대 5개
  }

  /**
   * 주요 이벤트 추출
   */
  private extractMainEvent(articles: NewsArticle[]): string {
    // 가장 최신 기사의 제목을 이벤트로 사용
    if (articles.length > 0) {
      return articles[0]?.title || '경제 이슈 발생';
    }
    return '경제 이슈 발생';
  }

  /**
   * 제목 생성 (이모지 포함)
   */
  private generateTitle(topic: string, direction: MarketDirection, articles: NewsArticle[]): string {
    const directionText = direction === 'up' ? '상승세' : direction === 'down' ? '하락세' : '변동성';

    // 핵심 키워드 추출
    const text = articles.map((a) => a.title).join(' ');
    let detail = '';

    if (topic === '환율') {
      const rates = text.match(/\d{1,},?\d{0,3}원/g);
      if (rates && rates.length > 0) {
        detail = `, ${rates[0]} 돌파`;
      }
    } else if (topic === '금리') {
      if (text.includes('동결')) detail = ' 동결';
      else if (text.includes('인상')) detail = ' 인상';
      else if (text.includes('인하')) detail = ' 인하';
    } else if (topic === '증시') {
      const indices = text.match(/코스피\s*\d{1,},?\d{0,3}/g);
      if (indices && indices.length > 0) {
        detail = `, ${indices[0]}`;
      }
    }

    // 출처 정리
    const sources = this.extractTopSources(articles, 3);
    const sourceText = sources.length > 0
      ? ` [${sources.join('·')} 등 ${articles.length}건]`
      : ` [${articles.length}건]`;

    return `📌 ${topic} ${directionText}${detail}${sourceText}`;
  }

  /**
   * 상위 언론사 추출
   */
  private extractTopSources(articles: NewsArticle[], limit: number): string[] {
    const sourceCounts = new Map<string, number>();

    articles.forEach((article) => {
      const source = article.source || '기타';
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });

    return Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([source]) => source);
  }

  /**
   * 우선순위 계산
   */
  private calculatePriority(articleCount: number, direction: MarketDirection): 'high' | 'medium' | 'low' {
    if (articleCount >= 10 && direction !== 'neutral') return 'high';
    if (articleCount >= 5) return 'medium';
    return 'low';
  }

  /**
   * 향상된 요약 생성
   */
  private generateEnhancedSummary(articles: NewsArticle[], topic: string, direction: MarketDirection): string {
    const count = articles.length;
    const directionText = direction === 'up' ? '상승세를 보이고' : direction === 'down' ? '하락세를 보이고' : '변동성을 보이고';

    const mainTopics: string[] = [];
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    // 주요 키워드 추출
    if (text.includes('미국') || text.includes('연준') || text.includes('Fed')) {
      mainTopics.push('미국 통화정책');
    }
    if (text.includes('중국') || text.includes('경기')) {
      mainTopics.push('글로벌 경기');
    }
    if (text.includes('물가') || text.includes('인플레이션')) {
      mainTopics.push('물가 상황');
    }
    if (text.includes('실적') || text.includes('기업')) {
      mainTopics.push('기업 실적');
    }

    const topicText = mainTopics.length > 0
      ? `${mainTopics.slice(0, 2).join(', ')} 등의 영향으로`
      : '다양한 요인으로';

    return `${topic} 관련 ${count}개 뉴스가 보도되었습니다. ${topicText} ${topic}이(가) ${directionText} 있으며, 이는 국내 경제와 투자자들에게 중요한 영향을 미칠 것으로 분석됩니다.`;
  }

  /**
   * 쉬운 설명 생성
   */
  private generateEasyExplanation(issueType: string, direction: MarketDirection, articles: NewsArticle[]): string {
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    switch (issueType) {
      case 'exchange_rate':
        if (direction === 'up') {
          return `💡 쉽게 이해하기\n\n달러 환율이 오른다는 것은 우리나라 돈의 가치가 떨어진다는 뜻입니다. ${
            text.includes('수입') ? '수입 제품 가격이 오르고 해외여행 비용이 늘어나지만, ' : ''
          }수출 기업들은 해외에서 번 돈을 원화로 바꿀 때 더 많은 돈을 받게 되어 유리합니다. ${
            text.includes('금리') ? '주로 미국의 금리가 오르면서 투자자들이 달러를 더 선호하게 되었기 때문입니다.' : '다양한 대외 경제 요인들이 복합적으로 작용한 결과입니다.'
          }`;
        } else if (direction === 'down') {
          return `💡 쉽게 이해하기\n\n달러 환율이 내린다는 것은 우리나라 돈의 가치가 올랐다는 뜻입니다. 해외여행이나 수입 제품을 구매할 때 유리해지지만, 수출 기업들은 해외에서 번 돈을 원화로 바꿀 때 받는 금액이 줄어들어 불리합니다. ${
            text.includes('무역') ? '우리나라의 무역 흑자가 늘어나거나 외국인 투자가 증가하면서 원화 수요가 늘어난 것이 주요 원인입니다.' : '국내외 경제 여건이 개선되면서 나타난 현상입니다.'
          }`;
        } else {
          return `💡 쉽게 이해하기\n\n환율이 불안정하게 움직이고 있습니다. 기업들은 환율 변동으로 인한 손실을 대비하기 위한 환헤지 비용이 늘어날 수 있으며, 개인 투자자들도 외화 자산 투자 시 더 신중해야 할 시기입니다.`;
        }

      case 'interest_rate':
        if (direction === 'up') {
          return `💡 쉽게 이해하기\n\n금리가 오른다는 것은 돈을 빌리는 비용이 늘어난다는 의미입니다. 주택담보대출이나 신용대출의 이자가 늘어나 가계 부담이 커지지만, 반대로 예금이나 적금에 넣어둔 돈은 더 많은 이자를 받을 수 있습니다. ${
            text.includes('인플레이션') || text.includes('물가') ? '주로 물가 상승을 잡기 위해 중앙은행이 금리를 올리는 경우가 많습니다.' : '경제 상황을 안정시키기 위한 통화정책의 일환입니다.'
          } 주식시장에는 부정적 영향을 미칠 수 있어 투자자들의 주의가 필요합니다.`;
        } else if (direction === 'down') {
          return `💡 쉽게 이해하기\n\n금리가 내린다는 것은 돈을 빌리는 비용이 줄어든다는 의미입니다. 대출 이자 부담이 줄어 소비와 투자가 활성화될 수 있지만, 예금과 적금의 이자 수익은 감소합니다. ${
            text.includes('경기') ? '경기 침체를 막고 경제를 활성화하기 위해 금리를 내리는 경우가 많습니다.' : '경제 여건 변화에 따른 통화정책 조정입니다.'
          } 부동산과 주식 같은 자산 시장에는 긍정적 영향을 줄 수 있습니다.`;
        } else {
          return `💡 쉽게 이해하기\n\n금리 정책이 불확실한 상황입니다. 중앙은행이 경기와 물가 상황을 지켜보며 신중하게 정책을 결정하고 있는 시기로, 대출이나 투자 계획이 있다면 금리 동향을 계속 주시해야 합니다.`;
        }

      case 'equity_market':
        if (direction === 'up') {
          const hasKospi = text.includes('코스피') || text.includes('KOSPI');
          const hasKosdaq = text.includes('코스닥') || text.includes('KOSDAQ');

          if (hasKospi && hasKosdaq) {
            return `💡 쉽게 이해하기\n\n주식시장이 전반적으로 상승세를 보이고 있습니다. ${
              text.includes('대형주') || text.includes('삼성') ? '대형주를 중심으로 상승세가 나타나고 있으며, 이는 기관과 외국인 투자자들의 매수세가 강하기 때문입니다. ' : ''
            }${
              text.includes('중소형주') ? '중소형주도 함께 오르면서 시장 전체의 분위기가 좋아지고 있습니다. ' : ''
            }다만, 급격한 상승 이후에는 조정이 올 수 있으니 단기 투자자들은 주의가 필요합니다.`;
          } else {
            return `💡 쉽게 이해하기\n\n주식시장이 상승하고 있습니다. ${
              text.includes('실적') ? '기업들의 실적 개선 기대감과 ' : ''
            }${
              text.includes('외국인') ? '외국인 투자자들의 순매수가 ' : '긍정적인 투자 심리가 '
            }시장 상승을 이끌고 있습니다. 보유 주식의 가치가 오르는 것은 좋지만, 고점에서 투자하는 것은 위험할 수 있으니 신중한 판단이 필요합니다.`;
          }
        } else if (direction === 'down') {
          return `💡 쉽게 이해하기\n\n주식시장이 하락하고 있습니다. ${
            text.includes('금리') ? '금리 상승 우려나 ' : ''
          }${
            text.includes('실적') ? '기업 실적 부진, ' : ''
          }${
            text.includes('외국인') ? '외국인 투자자들의 순매도 등이 ' : '부정적인 투자 심리가 '
          }하락의 주요 원인입니다. 공포에 휩싸여 패닉 매도를 하기보다는, 보유 종목의 펀더멘털을 다시 점검하고 장기 투자 관점에서 접근하는 것이 현명합니다. 우량주가 함께 빠진다면 오히려 매수 기회가 될 수도 있습니다.`;
        } else {
          return `💡 쉽게 이해하기\n\n주식시장이 방향성 없이 등락을 거듭하고 있습니다. 투자자들이 향후 경제 상황을 예측하기 어려워 관망세를 보이는 시기입니다. 이런 때는 무리한 단기 매매보다는 우량주를 중심으로 분할 매수하며 장기 투자 전략을 유지하는 것이 안전합니다.`;
        }

      default:
        return `💡 쉽게 이해하기\n\n현재 경제 상황을 종합적으로 분석해보면, 다양한 국내외 요인들이 복합적으로 작용하고 있습니다. 투자자와 소비자 모두 신중한 의사결정이 필요한 시기입니다.`;
    }
  }
}
