import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { EmployeeService } from './employee.service';

@ApiTags('HRM')
@Controller('admin/hrm/employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @RequirePermissions('HRM_EMPLOYEE:VIEW')
  async list(@Query() query: any, @Req() req: any) {
    return this.employeeService.list(req.user, query);
  }

  @Get(':id')
  @RequirePermissions('HRM_EMPLOYEE:VIEW')
  async getDetail(@Param('id') id: string) {
    return this.employeeService.getDetail(id);
  }

  @Post()
  @RequirePermissions('HRM_EMPLOYEE:CREATE')
  async create(@Body() body: any) {
    return this.employeeService.create(body);
  }

  @Put(':id')
  @RequirePermissions('HRM_EMPLOYEE:UPDATE')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.employeeService.update(id, body);
  }

  @Delete(':id')
  @RequirePermissions('HRM_EMPLOYEE:DELETE')
  async delete(@Param('id') id: string) {
    return this.employeeService.delete(id);
  }
}
