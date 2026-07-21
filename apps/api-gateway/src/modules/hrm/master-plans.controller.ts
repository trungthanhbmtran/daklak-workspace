import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { MasterPlansService } from './master-plans.service';

@ApiTags('HRM - Master Plans')
@ApiBearerAuth('JWT-auth')
@Controller('admin/hrm/master-plans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MasterPlansController {
  constructor(private readonly masterPlansService: MasterPlansService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('departmentId') reqDepartmentId?: string,
  ) {
    return this.masterPlansService.findAll(req.user, type, status, reqDepartmentId);
  }

  @Get('advanced/historical-feasibility')
  async getHistoricalFeasibility(
    @Query('type') type: string,
    @Query('title') title: string,
    @Query('durationDays') durationDays: string,
  ) {
    return this.masterPlansService.getHistoricalFeasibility(type, title, durationDays);
  }

  @Get(':id')
  async findById(@Req() req: any, @Param('id') id: string) {
    return this.masterPlansService.findById(req.user, id);
  }

  @Post('ai-generate')
  async generateFromAi(@Body('text') _text: string) {
    return this.masterPlansService.generateFromAi(_text);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.masterPlansService.create(req.user, body);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.masterPlansService.update(req.user, id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.masterPlansService.remove(id);
  }
}
