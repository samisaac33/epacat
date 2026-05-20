import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EpacomService } from './epacom.service';

@Injectable()
export class EpacomProcessor {
  constructor(private epacom: EpacomService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    return this.epacom.processPendingJobs();
  }
}
