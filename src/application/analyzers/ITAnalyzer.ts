/**
 * IT News Analyzer
 * IT 뉴스를 분석하여 인사이트 생성 (Rule-based)
 */

import type { NewsArticle } from '../../domain/shared/types.js';
import type { ITInsight } from '../../domain/it/types.js';
import { createITInsight } from '../../domain/it/entities.js';
import type { ITChangeType, ImpactLevel, AffectedParty } from '../../domain/it/types.js';

export class ITAnalyzer {
  /**
   * 뉴스 배열을 분석하여 인사이트 생성
   */
  analyze(articles: NewsArticle[]): ITInsight[] {
    if (articles.length < 5) {
      return [];
    }

    const insights: ITInsight[] = [];

    // 제품 출시 관련
    const productInsight = this.analyzeProductRelease(articles);
    if (productInsight) insights.push(productInsight);

    // 기술 변화 관련
    const techInsight = this.analyzeTechChange(articles);
    if (techInsight) insights.push(techInsight);

    // 보안 이슈 관련
    const securityInsight = this.analyzeSecurity(articles);
    if (securityInsight) insights.push(securityInsight);

    return insights;
  }

  /**
   * 제품 출시 분석
   */
  private analyzeProductRelease(articles: NewsArticle[]): ITInsight | null {
    const keywords = ['출시', '발표', '공개', '론칭', '업데이트', '버전', '릴리즈'];
    const relevantArticles = this.filterByKeywords(articles, keywords);

    if (relevantArticles.length < 3) return null;

    const affected = this.detectAffected(relevantArticles);
    const impact = this.assessImpact(relevantArticles);

    return createITInsight({
      title: this.generateTitle('제품', relevantArticles),
      summary: this.generateEnhancedSummary(relevantArticles, '제품 출시', impact),
      easyExplanation: this.generateEasyExplanation('product_release', relevantArticles, impact),
      data: {
        changeType: 'product_release',
        change: this.extractChange(relevantArticles),
        timing: this.extractTiming(relevantArticles),
        affected,
        impact: {
          level: impact,
          description: this.generateImpactDescription(relevantArticles, impact),
        },
        actionItems: this.generateActionItems(relevantArticles, 'product_release'),
        technologies: this.extractTechnologies(relevantArticles),
      },
      priority: impact === 'critical' || impact === 'significant' ? 'high' : 'medium',
      tags: this.extractTags(relevantArticles),
      sourceUrls: relevantArticles.slice(0, 3).map((a) => a.link),
    });
  }

  /**
   * 기술 변화 분석
   */
  private analyzeTechChange(articles: NewsArticle[]): ITInsight | null {
    const adoptKeywords = ['도입', '채택', '활용', '적용', '확대'];
    const deprecateKeywords = ['폐기', '중단', '종료', '지원 중단', 'deprecated'];

    const adoptArticles = this.filterByKeywords(articles, adoptKeywords);
    const deprecateArticles = this.filterByKeywords(articles, deprecateKeywords);

    let relevantArticles: NewsArticle[];
    let changeType: ITChangeType;

    if (adoptArticles.length >= deprecateArticles.length && adoptArticles.length >= 2) {
      relevantArticles = adoptArticles;
      changeType = 'tech_adoption';
    } else if (deprecateArticles.length >= 2) {
      relevantArticles = deprecateArticles;
      changeType = 'tech_deprecation';
    } else {
      return null;
    }

    const affected = this.detectAffected(relevantArticles);
    const impact = this.assessImpact(relevantArticles);

    return createITInsight({
      title: this.generateTitle('기술', relevantArticles),
      summary: this.generateEnhancedSummary(relevantArticles, changeType === 'tech_adoption' ? '기술 도입' : '기술 폐기', impact),
      easyExplanation: this.generateEasyExplanation(changeType, relevantArticles, impact),
      data: {
        changeType,
        change: this.extractChange(relevantArticles),
        timing: this.extractTiming(relevantArticles),
        affected,
        impact: {
          level: impact,
          description: this.generateImpactDescription(relevantArticles, impact),
        },
        actionItems: this.generateActionItems(relevantArticles, changeType),
        technologies: this.extractTechnologies(relevantArticles),
      },
      priority: impact === 'critical' || impact === 'significant' ? 'high' : 'medium',
      tags: this.extractTags(relevantArticles),
      sourceUrls: relevantArticles.slice(0, 3).map((a) => a.link),
    });
  }

  /**
   * 보안 이슈 분석
   */
  private analyzeSecurity(articles: NewsArticle[]): ITInsight | null {
    const keywords = ['보안', '해킹', '취약점', '침해', '유출', '랜섬웨어', '사이버'];
    const relevantArticles = this.filterByKeywords(articles, keywords);

    if (relevantArticles.length < 2) return null;

    return createITInsight({
      title: this.generateTitle('보안', relevantArticles),
      summary: this.generateEnhancedSummary(relevantArticles, '보안 이슈', 'critical'),
      easyExplanation: this.generateEasyExplanation('security', relevantArticles, 'critical'),
      data: {
        changeType: 'security',
        change: this.extractChange(relevantArticles),
        timing: '보안 위협 증가로 즉각 대응 필요',
        affected: ['developers', 'users', 'enterprises'],
        impact: {
          level: 'critical',
          description: this.generateImpactDescription(relevantArticles, 'critical'),
        },
        actionItems: this.generateActionItems(relevantArticles, 'security'),
        technologies: this.extractTechnologies(relevantArticles),
      },
      priority: 'high',
      tags: [...this.extractTags(relevantArticles), '보안', '긴급'],
      sourceUrls: relevantArticles.slice(0, 3).map((a) => a.link),
    });
  }

  private filterByKeywords(articles: NewsArticle[], keywords: string[]): NewsArticle[] {
    return articles.filter((article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();
      return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    });
  }

  private detectAffected(articles: NewsArticle[]): AffectedParty[] {
    const affected: Set<AffectedParty> = new Set();
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    if (text.includes('개발자') || text.includes('프로그래머') || text.includes('엔지니어')) {
      affected.add('developers');
    }
    if (text.includes('사용자') || text.includes('고객') || text.includes('소비자')) {
      affected.add('users');
    }
    if (text.includes('기업') || text.includes('회사') || text.includes('조직')) {
      affected.add('enterprises');
    }

    return affected.size > 0 ? Array.from(affected) : ['all'];
  }

  private assessImpact(articles: NewsArticle[]): ImpactLevel {
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ').toLowerCase();
    const highImpact = ['혁신', '혁명', '획기적', '급증', '폭발', '대규모'];
    const criticalImpact = ['긴급', '심각', '위기', '중단', '마비'];

    if (criticalImpact.some((word) => text.includes(word))) return 'critical';
    if (highImpact.some((word) => text.includes(word))) return 'significant';
    if (articles.length >= 5) return 'moderate';
    return 'minor';
  }

  private extractChange(articles: NewsArticle[]): string {
    return articles[0]?.title.replace(/\[.*?\]/g, '').trim() || 'IT 분야 변화';
  }

  private extractTiming(articles: NewsArticle[]): string {
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    if (text.includes('시장') || text.includes('수요')) {
      return '시장 수요 증가에 대응';
    }
    if (text.includes('경쟁') || text.includes('선점')) {
      return '경쟁 우위 확보를 위한 전략적 시점';
    }
    return '기술 발전에 따른 자연스러운 변화';
  }

  private generateImpactDescription(articles: NewsArticle[], level: ImpactLevel): string {
    const count = articles.length;

    switch (level) {
      case 'critical':
        return `${count}개 언론사에서 보도된 중대한 이슈로, 즉각적인 대응이 필요합니다.`;
      case 'significant':
        return `${count}개 주요 뉴스에서 다루어진 중요한 변화로, 업계 전반에 영향을 미칠 것으로 예상됩니다.`;
      case 'moderate':
        return `${count}개 기사에서 보도되었으며, 중장기적으로 영향을 미칠 수 있습니다.`;
      default:
        return `${count}개 뉴스에서 언급되었으나, 제한적인 영향으로 예상됩니다.`;
    }
  }

  private generateActionItems(_articles: NewsArticle[], changeType: ITChangeType): string[] {
    const items: string[] = [];

    switch (changeType) {
      case 'product_release':
        items.push('신제품 기능 및 스펙 상세 검토');
        items.push('기존 솔루션과 비교 분석');
        items.push('도입 시 ROI 및 비용 분석');
        break;
      case 'tech_adoption':
        items.push('새로운 기술 학습 계획 수립');
        items.push('파일럿 프로젝트 진행');
        items.push('팀 내 지식 공유 세션 진행');
        break;
      case 'tech_deprecation':
        items.push('대안 기술 조사 및 마이그레이션 계획 수립');
        items.push('기존 코드베이스 영향 범위 파악');
        items.push('마이그레이션 일정 및 리소스 배정');
        break;
      case 'security':
        items.push('시스템 보안 점검 즉시 실시');
        items.push('보안 패치 적용 및 취약점 스캔');
        items.push('보안 정책 재검토 및 팀 교육');
        break;
      default:
        items.push('추가 정보 수집 및 모니터링');
    }

    return items;
  }

  private extractTechnologies(articles: NewsArticle[]): string[] {
    const techKeywords = [
      'AI', 'GPT', 'ChatGPT', 'Claude', 'LLM',
      'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript',
      'Python', 'Java', 'Go', 'Rust',
      'AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker',
      'GitHub', 'GitLab', 'Copilot',
    ];

    const found: Set<string> = new Set();
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    techKeywords.forEach((tech) => {
      if (text.includes(tech)) {
        found.add(tech);
      }
    });

    return Array.from(found).slice(0, 5);
  }

  private extractTags(articles: NewsArticle[]): string[] {
    const tags: Set<string> = new Set();
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    const tagKeywords = [
      'AI', '개발도구', '클라우드', '보안', '프론트엔드', '백엔드',
      'DevOps', '데이터', '모바일', '웹', 'API', 'SaaS',
    ];

    tagKeywords.forEach((tag) => {
      if (text.includes(tag)) {
        tags.add(tag);
      }
    });

    return Array.from(tags).slice(0, 5);
  }

  private generateTitle(category: string, articles: NewsArticle[]): string {
    // 핵심 키워드 추출
    const text = articles.map((a) => a.title).join(' ');
    const keywords: string[] = [];

    // 주요 기술/제품 키워드
    const techList = ['ChatGPT', 'GPT', 'Claude', 'GitHub Copilot', 'Copilot', 'TypeScript', 'React', 'AWS', 'Azure', 'Docker', 'Kubernetes'];
    techList.forEach((tech) => {
      if (text.includes(tech) && keywords.length < 2) {
        keywords.push(tech);
      }
    });

    const keywordText = keywords.length > 0 ? ` ${keywords[0]}` : '';

    // 출처 정리
    const sources = this.extractTopSources(articles, 3);
    const sourceText = sources.length > 0
      ? ` [${sources.join('·')} 등 ${articles.length}건]`
      : ` [${articles.length}건]`;

    return `📌 [${category}]${keywordText}${sourceText}`;
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
   * 향상된 요약 생성
   */
  private generateEnhancedSummary(articles: NewsArticle[], topic: string, impact: ImpactLevel): string {
    const count = articles.length;
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    const technologies: string[] = [];
    const techList = ['AI', 'GPT', 'ChatGPT', 'Claude', 'GitHub', 'Copilot', 'React', 'TypeScript', 'JavaScript', 'Python', 'AWS', 'Azure', 'Docker', 'Kubernetes'];

    techList.forEach((tech) => {
      if (text.includes(tech)) {
        technologies.push(tech);
      }
    });

    const techMention = technologies.length > 0
      ? `${technologies.slice(0, 2).join(', ')} 등의 기술과 관련하여`
      : 'IT 업계에서';

    const impactText = impact === 'critical' || impact === 'significant'
      ? '개발자와 기업들이 주목해야 할 중요한 변화'
      : '관심을 가질 만한 흥미로운 변화';

    return `${topic} 관련 ${count}개 뉴스가 보도되었습니다. ${techMention} ${impactText}가 나타나고 있으며, 이는 개발 트렌드와 업무 방식에 영향을 미칠 것으로 보입니다.`;
  }

  /**
   * 쉬운 설명 생성
   */
  private generateEasyExplanation(changeType: ITChangeType, articles: NewsArticle[], _impact: ImpactLevel): string {
    const text = articles.map((a) => `${a.title} ${a.content}`).join(' ');

    switch (changeType) {
      case 'product_release': {
        const isAI = text.includes('AI') || text.includes('GPT') || text.includes('ChatGPT') || text.includes('Claude');
        const isDev = text.includes('GitHub') || text.includes('Copilot') || text.includes('개발');
        const isCloud = text.includes('AWS') || text.includes('Azure') || text.includes('GCP') || text.includes('클라우드');

        if (isAI && isDev) {
          return `💡 쉽게 이해하기\n\nAI 기반 개발 도구가 새롭게 출시되었습니다. 이런 도구들은 개발자가 코드를 작성할 때 자동으로 다음에 올 코드를 제안하거나, 버그를 찾아주거나, 문서를 자동으로 작성해주는 등 실제 업무에서 많은 시간을 절약해줍니다. \n\n개발자 입장에서는 반복적이고 단순한 작업은 AI에게 맡기고, 더 창의적이고 복잡한 문제 해결에 집중할 수 있게 됩니다. 다만 AI가 제안한 코드를 맹목적으로 신뢰하기보다는, 검토하고 이해하는 과정이 여전히 중요합니다.`;
        } else if (isCloud) {
          return `💡 쉽게 이해하기\n\n클라우드 서비스에 새로운 기능이 추가되었습니다. 클라우드는 쉽게 말해 '인터넷으로 빌려쓰는 컴퓨터'인데, 서버를 직접 구매하고 관리하는 대신 필요할 때만 빌려서 쓰고 사용한 만큼만 비용을 내면 됩니다.\n\n새로운 기능이 추가되면 개발자들은 더 적은 코드로 더 많은 일을 할 수 있게 되어 개발 기간이 단축되고, 기업 입장에서는 인프라 관리 비용을 절감하면서 서비스 품질은 향상시킬 수 있습니다.`;
        } else {
          return `💡 쉽게 이해하기\n\n새로운 제품이나 서비스가 출시되었습니다. IT 제품이 업그레이드되면 일반적으로 더 빠르고, 더 편리하고, 더 안전해집니다. \n\n개발자들은 새로운 기능을 배우는 데 시간을 투자해야 하지만, 장기적으로는 생산성이 향상됩니다. 기업 입장에서는 도입 비용과 효과를 비교해보고, 기존 시스템과의 호환성을 검토한 후 단계적으로 적용하는 것이 좋습니다.`;
        }
      }

      case 'tech_adoption': {
        const hasAI = text.includes('AI') || text.includes('머신러닝') || text.includes('딥러닝');
        const hasLanguage = text.includes('TypeScript') || text.includes('Rust') || text.includes('Go') || text.includes('Python');

        if (hasAI) {
          return `💡 쉽게 이해하기\n\nAI 기술을 도입하는 기업들이 늘어나고 있습니다. AI는 더 이상 먼 미래의 기술이 아니라, 실제 업무에서 활용되는 현실이 되었습니다.\n\n예를 들어, 고객 문의를 자동으로 분류하고 답변하거나, 데이터 패턴을 분석해서 미래를 예측하거나, 사진에서 특정 물체를 자동으로 찾아내는 등의 일을 AI가 처리합니다. 개발자는 이런 AI 기술을 이해하고 활용할 수 있는 능력이 점점 더 중요해지고 있습니다.`;
        } else if (hasLanguage) {
          return `💡 쉽게 이해하기\n\n새로운 프로그래밍 언어나 프레임워크가 주목받고 있습니다. 프로그래밍 언어는 개발자가 컴퓨터에게 명령을 내리는 방법인데, 새로운 언어들은 보통 더 안전하고, 더 빠르고, 더 쓰기 편한 것이 특징입니다.\n\n기존 언어에서 자주 발생하는 버그나 보안 문제를 근본적으로 방지하거나, 복잡한 코드를 간결하게 작성할 수 있게 해줍니다. 다만 새로운 기술을 배우는 데 시간이 들기 때문에, 프로젝트 상황에 맞춰 신중하게 도입을 결정해야 합니다.`;
        } else {
          return `💡 쉽게 이해하기\n\n새로운 기술이나 방법론을 도입하는 추세가 나타나고 있습니다. 기술은 계속 발전하기 때문에, 개발자와 기업은 새로운 트렌드를 이해하고 필요하다면 적극적으로 배워나가야 경쟁력을 유지할 수 있습니다.\n\n무조건 새로운 것을 따라가기보다는, 우리 팀의 상황과 프로젝트의 특성에 맞는지 검토하고, 작은 규모로 먼저 시도해본 후 점진적으로 확대하는 것이 안전한 접근 방식입니다.`;
        }
      }

      case 'tech_deprecation':
        return `💡 쉽게 이해하기\n\n기존에 사용하던 기술이나 서비스가 단종되거나 지원이 중단됩니다. 이는 해당 기술을 사용하는 개발자와 기업에게는 중대한 이슈입니다.\n\n지원이 끊긴 기술을 계속 사용하면 보안 취약점이 발견되어도 패치가 제공되지 않아 위험하고, 새로운 시스템과 호환되지 않는 문제도 생깁니다. 따라서 대체 기술을 찾아 마이그레이션(이전) 계획을 수립해야 합니다.\n\n마이그레이션은 시간과 비용이 드는 작업이지만, 미리 준비하면 서비스 중단 없이 안전하게 전환할 수 있습니다. 가능하면 지원 종료 최소 6개월 전부터 준비하는 것이 좋습니다.`;

      case 'security':
        return `💡 쉽게 이해하기\n\n보안 취약점이나 해킹 사고가 발생했습니다. 보안은 IT에서 가장 중요한 요소 중 하나인데, 한 번의 보안 사고로 개인정보가 유출되거나 서비스가 마비될 수 있기 때문입니다.\n\n${
          text.includes('랜섬웨어') ? '랜섬웨어는 컴퓨터의 파일을 암호화해서 인질로 잡고 돈을 요구하는 악성 프로그램입니다. ' : ''
        }${
          text.includes('취약점') ? '소프트웨어의 취약점은 해커가 침입할 수 있는 보안 구멍인데, 발견되면 즉시 패치(수정)를 적용해야 합니다. ' : ''
        }\n\n개발자는 보안 코딩 원칙을 지키고, 정기적으로 보안 점검을 하며, 사용자 데이터를 안전하게 다뤄야 합니다. 기업은 보안 교육을 강화하고, 백업을 정기적으로 하며, 보안 사고 대응 절차를 마련해두어야 합니다.`;

      default:
        return `💡 쉽게 이해하기\n\nIT 업계에 의미 있는 변화가 나타나고 있습니다. 기술은 빠르게 발전하기 때문에, 개발자와 기업 모두 지속적으로 학습하고 적응해나가는 것이 중요합니다. 새로운 기술이 나왔다고 무조건 도입하기보다는, 우리에게 정말 필요한지, 비용 대비 효과가 있는지 신중하게 판단해야 합니다.`;
    }
  }
}
