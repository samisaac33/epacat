import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@epacat/database';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators';
import { ComercialService } from './comercial.service';

@ApiTags('comercial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER, Role.ADMIN)
@Controller('comercial')
export class ComercialController {
  constructor(private comercialService: ComercialService) {}

  @Get('tarifas')
  listTarifas() {
    return this.comercialService.listTarifas();
  }

  @Get('analisis')
  getAnalisis() {
    return this.comercialService.getAnalisisPuntual();
  }
}
