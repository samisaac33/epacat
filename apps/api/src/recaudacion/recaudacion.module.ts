import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { RecaudacionController } from './recaudacion.controller';
import { RecaudacionService } from './recaudacion.service';

@Module({
  imports: [BillingModule],
  controllers: [RecaudacionController],
  providers: [RecaudacionService],
})
export class RecaudacionModule {}
