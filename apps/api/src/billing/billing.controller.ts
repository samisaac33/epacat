import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { registrarPagoSchema, tarifaInputSchema } from '@epacat/shared';
import { FacturaStatus, Role, User } from '@epacat/database';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, Roles } from '../auth/decorators';
import { BillingService } from './billing.service';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER, Role.ADMIN)
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('periodos')
  listPeriodos() {
    return this.billingService.listPeriodos();
  }

  @Get('periodos/actual')
  getPeriodoActual() {
    return this.billingService.getPeriodoActual();
  }

  @Post('periodos/:id/cerrar')
  cerrarPeriodo(@Param('id') id: string, @CurrentUser() user: User) {
    return this.billingService.cerrarPeriodo(id, user);
  }

  @Get('facturas')
  listFacturas(
    @Query('periodoId') periodoId?: string,
    @Query('status') status?: FacturaStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billingService.listFacturas({
      periodoId,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('facturas/:id')
  getFactura(@Param('id') id: string) {
    return this.billingService.getFactura(id);
  }

  @Post('facturas/:id/pagos')
  registrarPago(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(registrarPagoSchema)) body: typeof registrarPagoSchema._type,
  ) {
    return this.billingService.registrarPago(id, user, body);
  }

  @Get('tarifa')
  getTarifa() {
    return this.billingService.getTarifaActiva();
  }

  @Patch('tarifa')
  @Roles(Role.ADMIN)
  updateTarifa(
    @Body(new ZodValidationPipe(tarifaInputSchema)) body: typeof tarifaInputSchema._type,
  ) {
    return this.billingService.updateTarifa(body);
  }

  @Get('resumen')
  getResumen(@Query('periodoId') periodoId?: string) {
    return this.billingService.getResumen(periodoId);
  }
}
