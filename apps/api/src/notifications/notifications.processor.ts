import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private notifications: NotificationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleRecordatorios() {
    this.logger.log('Ejecutando recordatorios de cobranza');
    await this.notifications.sendRecordatoriosCobranza();
  }
}
