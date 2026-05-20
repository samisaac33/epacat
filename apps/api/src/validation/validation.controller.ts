import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { validationDecisionSchema } from '@epacat/shared';
import { ValidationStatus, Role } from '@epacat/database';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators';
import { ValidationService } from './validation.service';

@ApiTags('validation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER, Role.ADMIN)
@Controller('validation')
export class ValidationController {
  constructor(private validationService: ValidationService) {}

  @Get('queue')
  getQueue(
    @Query('status') status?: ValidationStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.validationService.getQueue(
      status ?? 'PENDING',
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch(':id')
  decide(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(validationDecisionSchema)) body: typeof validationDecisionSchema._type,
  ) {
    return this.validationService.decide(id, body);
  }
}
