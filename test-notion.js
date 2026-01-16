/**
 * Notion 저장 테스트 스크립트
 * 카카오톡 알림 없이 Notion에만 테스트 데이터 저장
 */

import 'dotenv/config';
import { NotionInsightRepository } from './dist/infrastructure/notion/NotionInsightRepository.js';
import { createEconomyInsight } from './dist/domain/economy/entities.js';
import { createITInsight } from './dist/domain/it/entities.js';

async function testNotion() {
  console.log('='.repeat(60));
  console.log('Notion 저장 테스트 시작');
  console.log('='.repeat(60));

  try {
    // Notion Repository 초기화
    const notionRepo = NotionInsightRepository.fromEnv();
    console.log('✅ Notion 연결 성공\n');

    // 테스트 1: 경제 인사이트 저장
    console.log('📊 [경제] 테스트 인사이트 생성 중...');
    const economyInsight = createEconomyInsight({
      title: '[테스트] 달러 환율 1,350원 돌파 - 수입 물가 압박 심화 우려',
      summary: `미국 연준의 매파적 기조와 중동 지정학적 리스크가 겹치며 달러/원 환율이 1,350원선을 돌파했습니다.
이는 연초 대비 8.2% 상승한 수치로, 수입 물가 상승과 가계 부담 증가가 예상됩니다.
반면 수출 기업의 경쟁력은 개선될 전망이나, 원자재 수입 비중이 높은 업종은 마진 악화를 겪을 수 있습니다.`,
      data: {
        issueType: 'exchange_rate',
        event: '달러/원 환율이 1,350원을 돌파하며 13개월 만에 최고치를 기록했습니다.',
        causes: [
          '미국 연준(Fed)의 긴축 기조 지속: 파월 의장이 "금리를 더 오래 높게 유지"하겠다고 발언하며 연내 추가 인상 가능성 시사',
          '중동 지정학적 리스크 고조: 이스라엘-하마스 전쟁 확대 우려로 안전자산 달러 수요 급증',
          '한국 경상수지 적자 지속: 9월 41억 달러 적자 기록으로 외환시장 불안 심리 증폭',
          '중국 경기 둔화: 한국 최대 수출국인 중국의 제조업 PMI 6개월 연속 위축으로 원화 약세 압력',
          '일본 엔화 약세 동조화: 엔/달러 환율도 150엔 돌파하며 아시아 통화 전반 약세'
        ],
        effects: [
          '수입 물가 상승: 원유, 천연가스 등 에너지 수입 비용 증가로 소비자 물가 0.3~0.5%p 추가 상승 전망',
          '가계 실질소득 감소: 수입 물가 상승으로 생필품 가격 인상, 가계 구매력 약화',
          '수출 기업 경쟁력 개선: 삼성전자, 현대차 등 달러 매출 비중 높은 기업은 환차익 발생 (삼성전자 연간 약 2조원 환차익 예상)',
          '외화 부채 기업 이자 부담 증가: 항공, 해운, 건설 등 외화 차입 비중 높은 업종 재무 악화 우려',
          '해외여행 비용 증가: 달러당 1,350원 기준 미국 여행 비용 10% 이상 상승',
          '외국인 투자 심리 위축: 환율 불안으로 외국인 주식 순매도 지속 (10월 1.2조원 순매도)'
        ],
        direction: 'up',
        metrics: {
          '현재환율': '1,350.5원',
          '전일대비': '+15.2원',
          '변동률': '+1.14%',
          '연초대비': '+8.2%',
          '52주최고': '1,350.5원',
          '외환보유액': '4,156억 달러'
        }
      },
      priority: 'high',
      tags: ['환율', '달러', '금리', '물가', '수출', '수입'],
      sourceUrls: [
        'https://example.com/news/exchange-rate-surge',
        'https://example.com/news/fed-policy'
      ]
    });

    await notionRepo.save(economyInsight);
    console.log('✅ 경제 인사이트 저장 완료\n');

    // 테스트 2: IT 인사이트 저장
    console.log('💻 [IT] 테스트 인사이트 생성 중...');
    const itInsight = createITInsight({
      title: '[테스트] GitHub Copilot, GPT-4 Turbo 탑재로 코드 제안 정확도 40% 향상',
      summary: `GitHub가 Copilot에 OpenAI의 최신 GPT-4 Turbo 모델을 적용하며 코드 제안 정확도를 40% 개선했습니다.
특히 복잡한 알고리즘과 프레임워크별 베스트 프랙티스 제안 능력이 크게 향상되었으며, 월 10달러 가격은 유지됩니다.
경쟁사인 Amazon CodeWhisperer(무료)와 Tabnine도 유사한 기능을 제공하고 있어, AI 코딩 어시스턴트 시장 경쟁이 본격화되고 있습니다.`,
      data: {
        changeType: 'product_release',
        change: 'GitHub Copilot이 GPT-4 Turbo를 탑재하여 코드 제안 정확도 40% 향상, 멀티 파일 컨텍스트 이해 능력 추가',
        timing: `AI 코딩 어시스턴트 시장이 급성장(2024년 17억 달러 → 2028년 68억 달러 전망)하는 가운데,
개발자 생산성 향상과 인력난 해소를 위한 기업들의 AI 도구 도입이 가속화되고 있습니다.`,
        affected: ['developers', 'enterprises'],
        impact: {
          level: 'significant',
          description: `• 개발 생산성: 코드 작성 시간 35~45% 단축 (GitHub 자체 연구)
• 코드 품질: 버그 발생률 15% 감소, 테스트 커버리지 자동 제안
• 학습 곡선: 신입 개발자의 온보딩 기간 30% 단축
• 비용 효율: 개발팀 인건비 대비 월 10달러는 압도적 ROI (연간 개발자당 약 5,000만원 절감 효과)
• 경쟁 심화: Amazon, JetBrains, Tabnine 등 경쟁 제품 출시로 선택지 확대`
        },
        actionItems: [
          '팀 차원 Copilot 도입 검토: 무료 트라이얼로 생산성 측정 (추천: 2주간 A/B 테스트)',
          '대안 도구 비교 분석: CodeWhisperer(무료), Tabnine(프라이버시 중시), Cursor(IDE 통합)',
          '코드 리뷰 프로세스 재설계: AI 제안 코드에 대한 보안/품질 검증 기준 마련',
          '라이선스/저작권 정책 수립: AI 생성 코드의 법적 책임 소재 명확화',
          '개발자 교육: AI 도구를 활용한 효율적 개발 방법론 내재화 (pair programming with AI)',
          '비용 분석: 팀 규모별 예산 산정 (10명 팀 기준 월 $100, 연간 $1,200)'
        ],
        technologies: ['GitHub Copilot', 'GPT-4 Turbo', 'OpenAI', 'VS Code', 'JetBrains', 'Neovim']
      },
      priority: 'high',
      tags: ['GitHub', 'AI', '개발도구', '생산성', 'GPT-4', 'Copilot'],
      sourceUrls: [
        'https://example.com/news/github-copilot-gpt4',
        'https://github.blog/changelog/copilot-improvements'
      ]
    });

    await notionRepo.save(itInsight);
    console.log('✅ IT 인사이트 저장 완료\n');

    console.log('='.repeat(60));
    console.log('✅ 모든 테스트 완료!');
    console.log('📖 Notion 데이터베이스를 확인해보세요.');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  }
}

// 실행
testNotion();
