import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@epacat/database';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators';
import { GisService } from './gis.service';

@ApiTags('gis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER, Role.ADMIN, Role.TECHNICIAN)
@Controller('gis')
export class GisController {
  constructor(private gisService: GisService) {}

  @Get('visitas')
  getVisitas(@Query('bbox') bbox?: string, @Query('status') status?: string) {
    return this.gisService.getVisitasGeoJson(bbox, status);
  }

  @Get('visitas/:id')
  getVisita(@Param('id') id: string) {
    return this.gisService.getVisitaDetail(id);
  }
}
