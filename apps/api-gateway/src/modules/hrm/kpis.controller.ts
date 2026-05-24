import { Controller, Get, Post, Body, Query, Inject, UseGuards, OnModuleInit, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('HRM - KPIs')
@Controller('admin/hrm/kpis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class KpisController implements OnModuleInit {
  private kpiService: any;

  constructor(
    @Inject(MICROSERVICES.KPI.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.kpiService = this.client.getService(MICROSERVICES.KPI.SERVICE);
  }

  @Get('periods')
  async findPeriods() {
    return firstValueFrom(this.kpiService.FindPeriods({}));
  }

  @Post('periods')
  async createPeriod(@Body() body: any) {
    return firstValueFrom(this.kpiService.CreatePeriod(body));
  }

  @Get('criteria')
  async findCriteria() {
    return firstValueFrom(this.kpiService.FindCriteria({}));
  }

  @Post('criteria')
  async createCriterion(@Body() body: any) {
    return firstValueFrom(this.kpiService.CreateCriterion(body));
  }

  @Put('criteria/:id')
  async updateCriterion(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.kpiService.UpdateCriterion({ id: Number(id), ...body }));
  }

  @Delete('criteria/:id')
  async deleteCriterion(@Param('id') id: string) {
    return firstValueFrom(this.kpiService.DeleteCriterion({ id: Number(id) }));
  }

  @Post('evaluations')
  async createEvaluation(@Body() body: any) {
    return firstValueFrom(this.kpiService.CreateEvaluation(body));
  }

  @Get('evaluations')
  async findEvaluations(@Query('employeeCode') employeeCode: string) {
    return firstValueFrom(this.kpiService.FindEvaluations({
      employeeCode,
    }));
  }
}
