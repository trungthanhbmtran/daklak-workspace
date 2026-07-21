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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { DepartmentService } from './department.service';

@ApiTags('HRM')
@Controller('admin/hrm/departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('tree')
  @ApiOperation({ summary: 'Cây sơ đồ tổ chức (user-service)' })
  async getTree(@Query('rootId') rootId?: string) {
    return this.departmentService.getTree(rootId);
  }

  @Post('move')
  @ApiOperation({
    summary:
      'Chuyển đơn vị sang đơn vị cha mới (user-service UpdateUnit parentId)',
  })
  async move(@Body() body: { id: number; newParentId?: number }) {
    return this.departmentService.move(body.id, body.newParentId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách đơn vị (flatten từ cây, user-service)' })
  async list(@Query() query: any) {
    return this.departmentService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết đơn vị (user-service)' })
  async getDetail(@Param('id') id: string) {
    return this.departmentService.getDetail(id);
  }

  @Get(':id/employees')
  @ApiOperation({
    summary: 'Nhân viên thuộc đơn vị (hrm-service) - DEPRECATED',
  })
  async listEmployees(@Param('id') id: string) {
    throw new Error(
      'Vui lòng sử dụng API /admin/hrm/employees để lấy danh sách nhân viên nhằm đảm bảo PBAC.',
    );
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn vị (user-service)' })
  async create(@Body() body: any) {
    return this.departmentService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn vị (user-service)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.departmentService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn vị (user-service)' })
  async delete(@Param('id') id: string) {
    return this.departmentService.delete(id);
  }
}
