import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SyncModule } from './sync/sync.module';
import { PhotosModule } from './photos/photos.module';
import { ValidationModule } from './validation/validation.module';
import { GisModule } from './gis/gis.module';
import { CatastroModule } from './catastro/catastro.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RecaudacionModule } from './recaudacion/recaudacion.module';
import { ComercialModule } from './comercial/comercial.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    SyncModule,
    PhotosModule,
    ValidationModule,
    GisModule,
    CatastroModule,
    BillingModule,
    NotificationsModule,
    RecaudacionModule,
    ComercialModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
