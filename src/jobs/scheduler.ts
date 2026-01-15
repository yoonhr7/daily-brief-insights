/**
 * Job Scheduler
 *
 * Schedules and runs the daily brief analysis
 * - Morning run
 * - Evening run
 */

import cron from 'node-cron';
import { DailyBriefService } from '../application/DailyBriefService.js';

export class DailyBriefScheduler {
  private morningSchedule: string;
  private eveningSchedule: string;
  private service: DailyBriefService;

  constructor(service: DailyBriefService, morningSchedule: string, eveningSchedule: string) {
    this.service = service;
    this.morningSchedule = morningSchedule;
    this.eveningSchedule = eveningSchedule;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    console.log('Starting Daily Brief Scheduler...');
    console.log(`Morning schedule: ${this.morningSchedule}`);
    console.log(`Evening schedule: ${this.eveningSchedule}`);

    // Morning job
    cron.schedule(this.morningSchedule, async () => {
      console.log('\n[MORNING] Triggering daily brief analysis...');
      try {
        await this.service.runDailyBrief();
      } catch (error) {
        console.error('[MORNING] Failed to run daily brief:', error);
      }
    });

    // Evening job
    cron.schedule(this.eveningSchedule, async () => {
      console.log('\n[EVENING] Triggering daily brief analysis...');
      try {
        await this.service.runDailyBrief();
      } catch (error) {
        console.error('[EVENING] Failed to run daily brief:', error);
      }
    });

    console.log('Scheduler started successfully. Waiting for scheduled times...\n');
  }

  /**
   * Run immediately (for testing)
   */
  async runNow(): Promise<void> {
    console.log('\n[MANUAL] Running daily brief analysis now...');
    await this.service.runDailyBrief();
  }

  /**
   * Factory method to create scheduler from environment variables
   */
  static fromEnv(service: DailyBriefService): DailyBriefScheduler {
    const morningSchedule = process.env['MORNING_SCHEDULE'] ?? '0 8 * * *'; // Default: 8 AM
    const eveningSchedule = process.env['EVENING_SCHEDULE'] ?? '0 20 * * *'; // Default: 8 PM

    return new DailyBriefScheduler(service, morningSchedule, eveningSchedule);
  }
}
