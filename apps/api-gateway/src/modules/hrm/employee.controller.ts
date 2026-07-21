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
import { EmployeeService } from './employee.service';

@ApiTags('HRM')
@Controller('admin/hrm/employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  async list(@Query() query: any, @Req() req: any) {
    return this.employeeService.list(req.user, query);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.employeeService.getDetail(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.employeeService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.employeeService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.employeeService.delete(id);
  }
}
