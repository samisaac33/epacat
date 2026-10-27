import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { recaudacionPagoSchema, recaudacionReversoSchema } from '@epacat/shared';
import { Role } from '@epacat/database';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators';
import { BancoApiKeyGuard } from './banco-api-key.guard';
import { RecaudacionService } from './recaudacion.service';

@ApiTags('recaudacion')
@Controller('recaudacion')
export class RecaudacionController {
  constructor(private recaudacionService: RecaudacionService) {}

  @Get('v1/consulta')
  @UseGuards(BancoApiKeyGuard)
  @ApiHeader({ name: 'X-Banco-Api-Key', required: true })
  consulta(@Query('identificacion') identificacion: string) {
    if (!identificacion?.trim()) {
      throw new BadRequestException('identificacion requerida');
    }
    return this.recaudacionService.consultarDeuda(identificacion.trim());
  }

  @Post('v1/pago')
  @UseGuards(BancoApiKeyGuard)
  @ApiHeader({ name: 'X-Banco-Api-Key', required: true })
  pago(@Body(new ZodValidationPipe(recaudacionPagoSchema)) body: typeof recaudacionPagoSchema._type) {
    return this.recaudacionService.notificarPago(body);
  }

  @Post('v1/reverso')
  @UseGuards(BancoApiKeyGuard)
  @ApiHeader({ name: 'X-Banco-Api-Key', required: true })
  reverso(
    @Body(new ZodValidationPipe(recaudacionReversoSchema)) body: typeof recaudacionReversoSchema._type,
  ) {
    return this.recaudacionService.reverso(body);
  }

  @Post('simular/consulta')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  simularConsulta(@Body('identificacion') identificacion: string) {
    return this.recaudacionService.consultarDeuda(identificacion);
  }

  @Post('simular/pago')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  simularPago(
    @Body(new ZodValidationPipe(recaudacionPagoSchema)) body: typeof recaudacionPagoSchema._type,
  ) {
    return this.recaudacionService.notificarPago(body);
  }
}
