import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { syncBatchInputSchema } from '@epacat/shared';
import { User } from '@epacat/database';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';
import { SyncService } from './sync.service';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('batches')
  processBatch(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(syncBatchInputSchema)) body: typeof syncBatchInputSchema._type,
  ) {
    return this.syncService.processBatch(user, body);
  }

  @Get('status/:deviceId')
  getStatus(@Param('deviceId') deviceId: string) {
    return this.syncService.getStatus(deviceId);
  }
}
