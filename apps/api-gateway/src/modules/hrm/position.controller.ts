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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { PositionService } from './position.service';

@ApiTags('HRM')
@Controller('admin/hrm/positions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách định biên theo đơn vị (user-service GetStaffingReport)',
  })
  async list(@Query() query: any) {
    return this.positionService.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết một định biên (tìm trong báo cáo đơn vị)',
  })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.positionService.getDetail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thiết lập định biên (user-service SetStaffing)' })
  async create(@Body() body: any) {
    return this.positionService.create(body);
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Cập nhật định biên (user-service SetStaffing với unitId/jobTitleId từ body)',
  })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.positionService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Xóa định biên: chưa hỗ trợ; dùng organizations/staffing hoặc set quantity = 0',
  })
  async delete() {
    return this.positionService.delete();
  }
}
