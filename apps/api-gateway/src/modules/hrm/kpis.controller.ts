import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { KpisService } from './kpis.service';

@ApiTags('HRM - KPIs')
@Controller('admin/hrm/kpis')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth('JWT-auth')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get('periods')
  async findPeriods() {
    return this.kpisService.findPeriods();
  }

  @Post('periods')
  async createPeriod(@Body() body: any) {
    return this.kpisService.createPeriod(body);
  }

  @Get('criteria')
  async findCriteria(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.kpisService.findCriteria(req.user, page, limit);
  }

  @Post('criteria')
  @Roles(Role.ADMIN)
  async createCriterion(@Body() body: any) {
    return this.kpisService.createCriterion(body);
  }

  @Put('criteria/:id')
  @Roles(Role.ADMIN)
  async updateCriterion(@Param('id') id: string, @Body() body: any) {
    return this.kpisService.updateCriterion(id, body);
  }

  @Delete('criteria/:id')
  @Roles(Role.ADMIN)
  async deleteCriterion(@Param('id') id: string) {
    return this.kpisService.deleteCriterion(id);
  }

  @Post('evaluations')
  async createEvaluation(@Req() req: any, @Body() body: any) {
    return this.kpisService.createEvaluation(req.user, body);
  }

  @Get('evaluations')
  async findEvaluations(
    @Req() req: any,
    @Query('employeeCode') employeeCode: string,
  ) {
    return this.kpisService.findEvaluations(req.user, employeeCode);
  }

  @Get('dashboard-stats')
  async getDashboardStats(
    @Req() req: any,
    @Query('periodId') periodId: string,
  ) {
    return this.kpisService.getDashboardStats(req.user, periodId);
  }

  @Post('evaluations/calculate-personal')
  async calculatePersonalKpi(
    @Req() req: any,
    @Body()
    body: { periodId: number; employeeCode?: string; staffingSlotId?: number },
  ) {
    return this.kpisService.calculatePersonalKpi(req.user, body);
  }

  @Get('evaluations/:id')
  async getEvaluationDetail(@Param('id') id: string) {
    return this.kpisService.getEvaluationDetail(id);
  }

  @Post('evaluations/:id/submit')
  async submitSelfScore(@Param('id') id: string, @Body() body: any) {
    return this.kpisService.submitSelfScore(id, body);
  }

  @Post('evaluations/:id/approve')
  async approveEvaluation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.kpisService.approveEvaluation(req.user, id, body);
  }
}
