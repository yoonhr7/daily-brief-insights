/**
 * DailyBrief Entry Point
 *
 * Initializes the application and starts the scheduler
 */

import { DailyBriefService } from './application/DailyBriefService.js';
import { DailyBriefScheduler } from './jobs/scheduler.js';
import { GoogleNewsRepository } from './infrastructure/google/GoogleNewsRepository.js';
import { NaverNewsRepository } from './infrastructure/naver/NaverNewsRepository.js';
import { CompositeNewsRepository } from './infrastructure/news/CompositeNewsRepository.js';
import { NotionInsightRepository } from './infrastructure/notion/NotionInsightRepository.js';
import { KakaoNotificationService } from './infrastructure/kakao/KakaoNotificationService.js';

async function main() {
  console.log('Initializing DailyBrief...\n');

  // Load environment variables
  // Note: In production, use dotenv or similar
  // For now, assuming environment variables are set

  try {
    // Initialize infrastructure adapters
    // Combine Google News + Naver News
    const googleNews = GoogleNewsRepository.fromEnv();
    const naverNews = NaverNewsRepository.fromEnv();
    const newsRepository = new CompositeNewsRepository([googleNews, naverNews]);

    const insightRepository = NotionInsightRepository.fromEnv();
    const notificationService = KakaoNotificationService.fromEnv();

    // Initialize application service
    const dailyBriefService = new DailyBriefService(
      newsRepository,
      insightRepository,
      notificationService
    );

    // Initialize scheduler
    const scheduler = DailyBriefScheduler.fromEnv(dailyBriefService);

    // Check command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--now')) {
      // Run immediately for testing
      await scheduler.runNow();
      process.exit(0);
    } else {
      // Start scheduler for continuous operation
      scheduler.start();
    }
  } catch (error) {
    console.error('Failed to initialize DailyBrief:', error);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\nShutting down DailyBrief...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down DailyBrief...');
  process.exit(0);
});

// Start the application
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
