import { Module } from '@nestjs/common';
import { EpacomService } from './epacom.service';
import { EpacomProcessor } from './epacom.processor';

@Module({
  providers: [EpacomService, EpacomProcessor],
  exports: [EpacomService],
})
export class EpacomModule {}
