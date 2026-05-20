import { Module } from '@nestjs/common';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { EpacomModule } from '../epacom/epacom.module';

@Module({
  imports: [EpacomModule],
  controllers: [ValidationController],
  providers: [ValidationService],
})
export class ValidationModule {}
