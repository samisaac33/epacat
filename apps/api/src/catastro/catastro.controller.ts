import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatastroService } from './catastro.service';

@ApiTags('catastro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catastro')
export class CatastroController {
  constructor(private catastroService: CatastroService) {}

  @Get('abonados')
  listAbonados(@Query('sector') sector?: string) {
    return this.catastroService.listAbonados(sector);
  }

  @Get('abonados/:id')
  getAbonado(@Param('id') id: string) {
    return this.catastroService.getAbonado(id);
  }

  @Get('medidores/:id')
  getMedidor(@Param('id') id: string) {
    return this.catastroService.getMedidor(id);
  }
}
