import {
  Controller,
  Get,
  Post,
  Put,
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
    return this.masterPlansService.findAll(
      req.user,
      type,
      status,
      reqDepartmentId,
    );
  }

  @Get(':id')
  async findById(@Req() req: any, @Param('id') id: string) {
    return this.masterPlansService.findById(req.user, id);
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.masterPlansService.create(req.user, body);
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.masterPlansService.update(req.user, id, body);
  }
}
