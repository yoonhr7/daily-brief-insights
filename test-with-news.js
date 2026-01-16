/**
 * 실제 뉴스 수집 + Notion 저장 테스트
 * (카카오톡 알림 제외)
 */

import 'dotenv/config';
import { AnalyzeNewsUseCase } from './dist/application/AnalyzeNewsUseCase.js';
import { GoogleNewsRepository } from './dist/infrastructure/google/GoogleNewsRepository.js';
import { NaverNewsRepository } from './dist/infrastructure/naver/NaverNewsRepository.js';
import { CompositeNewsRepository } from './dist/infrastructure/news/CompositeNewsRepository.js';
import { NotionInsightRepository } from './dist/infrastructure/notion/NotionInsightRepository.js';

// 더미 Notification Service (실제로 전송하지 않음)
class DummyNotificationService {
  async send(insight) {
    console.log(`📱 [알림 생략] ${insight.title}`);
  }

  async sendBatch(insights) {
    console.log(`📱 [알림 생략] ${insights.length}개 인사이트`);
  }
}

async function testWithNews() {
  console.log('='.repeat(60));
  console.log('실제 뉴스 수집 + Notion 저장 테스트');
  console.log('='.repeat(60));

  try {
    // 뉴스 소스 초기화
    const googleNews = GoogleNewsRepository.fromEnv();
    const naverNews = NaverNewsRepository.fromEnv();
    const newsRepository = new CompositeNewsRepository([googleNews, naverNews]);

    // Notion 초기화
    const insightRepository = NotionInsightRepository.fromEnv();

    // 더미 알림 서비스 (실제 전송 안 함)
    const notificationService = new DummyNotificationService();

    console.log('✅ 모든 서비스 초기화 완료\n');

    // UseCase 생성 (Gemini API Key 포함)
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const analyzeUseCase = new AnalyzeNewsUseCase(
      newsRepository,
      insightRepository,
      notificationService,
      geminiApiKey
    );

    // 경제 뉴스 수집 테스트
    console.log('📊 [경제] 뉴스 수집 중...\n');
    await analyzeUseCase.execute('economy');

    // IT 뉴스 수집 테스트
    console.log('\n💻 [IT] 뉴스 수집 중...\n');
    await analyzeUseCase.execute('it');

    console.log('\n='.repeat(60));
    console.log('✅ 테스트 완료!');
    console.log('\n💡 이제 Gemini AI가 뉴스를 분석하여 인사이트를 생성합니다!');
    console.log('   - 맥락을 이해한 자연스러운 분석');
    console.log('   - 원인, 영향, 쉬운 설명 자동 생성');
    console.log('   - 출처와 함께 구조화된 제목');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  }
}

testWithNews();
